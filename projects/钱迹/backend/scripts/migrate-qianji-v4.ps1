$ErrorActionPreference = 'Stop'

$backendDirectory = Split-Path -Parent $PSScriptRoot
$mysql = 'D:\MySql\mysql-8.0.34-winx64\bin\mysql.exe'
$maven = (Get-Command mvn.cmd -ErrorAction Stop).Source
$standardOutput = Join-Path $env:TEMP 'qianji-v4-flyway.out.log'
$standardError = Join-Path $env:TEMP 'qianji-v4-flyway.err.log'
$plainPassword = $null
$mavenProcess = $null

function ConvertFrom-SecureStringPlainText {
    param([Security.SecureString]$SecureString)

    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    }
    finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
}

function Get-V4MigrationCount {
    $result = & $mysql --login-path=mysql80-qianji --protocol=TCP `
        --batch --skip-column-names `
        -e "SELECT COUNT(*) FROM flyway_schema_history WHERE version='4' AND success=1;" qianji
    if ($LASTEXITCODE -ne 0) {
        throw '无法读取钱迹 Flyway 迁移状态。'
    }
    return [int]$result
}

try {
    if ((Get-Service -Name QianJiMySQL8).Status -ne 'Running') {
        throw 'QianJiMySQL8 服务未运行。'
    }

    if ((Get-V4MigrationCount) -eq 1) {
        Write-Host 'Flyway V4 已执行，无需重复迁移。' -ForegroundColor Green
        exit 0
    }

    Write-Host '请输入钱迹项目数据库账号 qianji 的密码。' -ForegroundColor Cyan
    $securePassword = Read-Host '数据库密码' -AsSecureString
    $plainPassword = ConvertFrom-SecureStringPlainText $securePassword
    if ([string]::IsNullOrWhiteSpace($plainPassword)) {
        throw '密码不能为空。'
    }

    $env:QIANJI_R2DBC_URL =
        'r2dbc:mysql://127.0.0.1:3307/qianji?sslMode=DISABLED&serverZoneId=Asia/Shanghai'
    $env:QIANJI_JDBC_URL =
        'jdbc:mysql://127.0.0.1:3307/qianji?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
    $env:QIANJI_DB_USERNAME = 'qianji'
    $env:QIANJI_DB_PASSWORD = $plainPassword
    $env:QIANJI_SERVER_PORT = '0'
    $env:QIANJI_FLYWAY_ENABLED = 'true'

    Remove-Item -LiteralPath $standardOutput, $standardError -Force -ErrorAction SilentlyContinue
    $mavenProcess = Start-Process -FilePath $maven `
        -ArgumentList @('spring-boot:run', '-Dspring-boot.run.arguments=--server.port=0') `
        -WorkingDirectory $backendDirectory `
        -WindowStyle Hidden `
        -PassThru `
        -RedirectStandardOutput $standardOutput `
        -RedirectStandardError $standardError

    $deadline = (Get-Date).AddSeconds(120)
    do {
        Start-Sleep -Seconds 1
        if ((Get-V4MigrationCount) -eq 1) {
            Write-Host 'Flyway V4 已执行完成。' -ForegroundColor Green
            exit 0
        }
    } while (-not $mavenProcess.HasExited -and (Get-Date) -lt $deadline)

    $details = @(
        Get-Content -LiteralPath $standardOutput -Tail 50 -ErrorAction SilentlyContinue
        Get-Content -LiteralPath $standardError -Tail 50 -ErrorAction SilentlyContinue
    ) -join [Environment]::NewLine
    throw "Flyway V4 未在限定时间内完成。日志：$details"
}
catch {
    Write-Host "迁移失败：$($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
finally {
    if ($mavenProcess -and -not $mavenProcess.HasExited) {
        & taskkill.exe /PID $mavenProcess.Id /T /F *> $null
    }
    Remove-Item Env:QIANJI_R2DBC_URL -ErrorAction SilentlyContinue
    Remove-Item Env:QIANJI_JDBC_URL -ErrorAction SilentlyContinue
    Remove-Item Env:QIANJI_DB_USERNAME -ErrorAction SilentlyContinue
    Remove-Item Env:QIANJI_DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:QIANJI_SERVER_PORT -ErrorAction SilentlyContinue
    Remove-Item Env:QIANJI_FLYWAY_ENABLED -ErrorAction SilentlyContinue
    $plainPassword = $null
}
