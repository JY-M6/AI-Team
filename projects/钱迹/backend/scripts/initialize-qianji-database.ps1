$ErrorActionPreference = 'Stop'

$backendDirectory = Split-Path -Parent $PSScriptRoot
$mysql = 'D:\MySql\mysql-8.0.34-winx64\bin\mysql.exe'
$configEditor = 'D:\MySql\mysql-8.0.34-winx64\bin\mysql_config_editor.exe'
$mavenRepository = Join-Path $env:TEMP 'qianji-maven-repository-validation'
$standardOutput = Join-Path $env:TEMP 'qianji-flyway.out.log'
$standardError = Join-Path $env:TEMP 'qianji-flyway.err.log'
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

function Invoke-NativeCommand {
    param([scriptblock]$Command)

    $previousPreference = $ErrorActionPreference
    try {
        $ErrorActionPreference = 'Continue'
        & $Command | Out-Host
        $exitCode = $LASTEXITCODE
        return $exitCode
    }
    finally {
        $ErrorActionPreference = $previousPreference
    }
}

try {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]::new($identity)
    $isAdministrator = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $isAdministrator) {
        throw '请在管理员 PowerShell 中运行此脚本。'
    }

    if ((Get-Service -Name QianJiMySQL8).Status -ne 'Running') {
        throw 'QianJiMySQL8 服务未运行。'
    }

    $maven = (Get-Command mvn.cmd -ErrorAction Stop).Source

    Write-Host '请设置钱迹项目专用数据库账号 qianji 的密码。' -ForegroundColor Cyan
    $first = Read-Host '请输入项目账号密码' -AsSecureString
    $second = Read-Host '请再次输入项目账号密码' -AsSecureString
    $plainPassword = ConvertFrom-SecureStringPlainText $first
    $confirmation = ConvertFrom-SecureStringPlainText $second

    if ([string]::IsNullOrWhiteSpace($plainPassword)) {
        throw '密码不能为空。'
    }
    if ($plainPassword -cne $confirmation) {
        throw '两次输入的密码不一致。'
    }
    $confirmation = $null

    $sqlPassword = $plainPassword.Replace('\', '\\').Replace("'", "''")
    $accountSql = @"
CREATE USER IF NOT EXISTS 'qianji'@'localhost' IDENTIFIED BY '$sqlPassword';
ALTER USER 'qianji'@'localhost' IDENTIFIED BY '$sqlPassword';
GRANT ALL PRIVILEGES ON qianji.* TO 'qianji'@'localhost';
FLUSH PRIVILEGES;
"@
    $exitCode = Invoke-NativeCommand {
        $accountSql | & $mysql --login-path=mysql80-admin --protocol=TCP
    }
    if ($exitCode -ne 0) {
        throw '钱迹项目数据库账号创建失败。'
    }

    Write-Host '请再次输入同一密码，保存加密登录路径 mysql80-qianji。' -ForegroundColor Green
    $exitCode = Invoke-NativeCommand {
        & $configEditor set --login-path=mysql80-qianji --host=127.0.0.1 --port=3307 `
            --user=qianji --password
    }
    if ($exitCode -ne 0) {
        throw 'mysql80-qianji 登录路径保存失败。'
    }

    $exitCode = Invoke-NativeCommand {
        & $mysql --login-path=mysql80-qianji --protocol=TCP --batch --skip-column-names `
            -e 'SELECT CURRENT_USER(), DATABASE();' qianji
    }
    if ($exitCode -ne 0) {
        throw 'mysql80-qianji 登录路径验证失败。'
    }

    $env:QIANJI_R2DBC_URL = 'r2dbc:mysql://127.0.0.1:3307/qianji?sslMode=DISABLED&serverZoneId=Asia/Shanghai'
    $env:QIANJI_JDBC_URL = 'jdbc:mysql://127.0.0.1:3307/qianji?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
    $env:QIANJI_DB_USERNAME = 'qianji'
    $env:QIANJI_DB_PASSWORD = $plainPassword
    $env:QIANJI_SERVER_PORT = '0'
    $env:QIANJI_FLYWAY_ENABLED = 'true'

    Remove-Item -LiteralPath $standardOutput, $standardError -Force -ErrorAction SilentlyContinue
    $arguments = @(
        '-o',
        "-Dmaven.repo.local=$mavenRepository",
        'spring-boot:run',
        '-Dspring-boot.run.arguments=--server.port=0'
    )
    $mavenProcess = Start-Process -FilePath $maven -ArgumentList $arguments `
        -WorkingDirectory $backendDirectory -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput $standardOutput -RedirectStandardError $standardError

    $deadline = (Get-Date).AddSeconds(120)
    $migrationCount = 0
    do {
        Start-Sleep -Seconds 1
        $countOutput = & $mysql --login-path=mysql80-admin --protocol=TCP --batch --skip-column-names `
            -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='qianji' AND TABLE_NAME='flyway_schema_history';"
        if ($LASTEXITCODE -eq 0 -and [int]$countOutput -eq 1) {
            $migrationOutput = & $mysql --login-path=mysql80-admin --protocol=TCP --batch --skip-column-names `
                -e 'SELECT COUNT(*) FROM qianji.flyway_schema_history WHERE success=1;'
            if ($LASTEXITCODE -eq 0) {
                $migrationCount = [int]$migrationOutput
            }
        }
    } while ($migrationCount -lt 3 -and -not $mavenProcess.HasExited -and (Get-Date) -lt $deadline)

    if ($migrationCount -lt 3) {
        $details = @(
            Get-Content -LiteralPath $standardOutput -Tail 40 -ErrorAction SilentlyContinue
            Get-Content -LiteralPath $standardError -Tail 40 -ErrorAction SilentlyContinue
        ) -join [Environment]::NewLine
        throw "Flyway 未完成三条迁移。日志：$details"
    }

    Write-Host 'Flyway V1/V2/V3 已执行完成。' -ForegroundColor Green
}
catch {
    Write-Host "初始化失败：$($_.Exception.Message)" -ForegroundColor Red
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
