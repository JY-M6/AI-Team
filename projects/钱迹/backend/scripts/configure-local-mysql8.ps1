$ErrorActionPreference = 'Stop'

$serviceName = 'QianJiMySQL8'
$mysql = 'D:\MySql\mysql-8.0.34-winx64\bin\mysql.exe'
$configEditor = 'D:\MySql\mysql-8.0.34-winx64\bin\mysql_config_editor.exe'
$passwordChanged = $false
$plainPassword = $null

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

    Start-Service -Name $serviceName
    $deadline = (Get-Date).AddSeconds(30)
    do {
        Start-Sleep -Milliseconds 500
        $service = Get-Service -Name $serviceName
        $listener = Get-NetTCPConnection -LocalPort 3307 -State Listen -ErrorAction SilentlyContinue
    } while (((-not $listener) -or $service.Status -ne 'Running') -and (Get-Date) -lt $deadline)

    if (-not $listener) {
        throw 'QianJiMySQL8 未能正常监听 3307 端口。'
    }

    $exitCode = Invoke-NativeCommand {
        & $mysql --protocol=TCP -h 127.0.0.1 -P 3307 -u root --skip-password -e 'SELECT 1;'
    }
    if ($exitCode -ne 0) {
        throw '新实例已经设置过 root 密码，不能再次使用空密码初始化流程。'
    }

    Write-Host '请设置 QianJiMySQL8 的 root 密码。' -ForegroundColor Cyan
    $first = Read-Host '请输入新密码' -AsSecureString
    $second = Read-Host '请再次输入新密码' -AsSecureString
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
    $exitCode = Invoke-NativeCommand {
        "ALTER USER 'root'@'localhost' IDENTIFIED BY '$sqlPassword';" |
            & $mysql --protocol=TCP -h 127.0.0.1 -P 3307 -u root --skip-password
    }
    if ($exitCode -ne 0) {
        throw 'MySQL 8 root 密码设置失败。'
    }
    $passwordChanged = $true

    $env:MYSQL_PWD = $plainPassword
    $exitCode = Invoke-NativeCommand {
        & $mysql --protocol=TCP -h 127.0.0.1 -P 3307 -u root --batch --skip-column-names `
            -e 'SELECT CURRENT_USER(), VERSION();'
    }
    if ($exitCode -ne 0) {
        throw '新密码验证失败。'
    }
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue

    Write-Host '请再次输入同一密码，保存加密登录路径 mysql80-admin。' -ForegroundColor Green
    $exitCode = Invoke-NativeCommand {
        & $configEditor set --login-path=mysql80-admin --host=127.0.0.1 --port=3307 --user=root --password
    }
    if ($exitCode -ne 0) {
        throw 'mysql80-admin 登录路径保存失败。'
    }

    $exitCode = Invoke-NativeCommand {
        & $mysql --login-path=mysql80-admin --protocol=TCP --batch --skip-column-names `
            -e 'SELECT CURRENT_USER(), VERSION();'
    }
    if ($exitCode -ne 0) {
        throw 'mysql80-admin 验证失败，请确认最后输入的是同一密码。'
    }

    Write-Host 'QianJiMySQL8 root 密码和登录路径均已配置成功。' -ForegroundColor Green
}
catch {
    Write-Host "配置失败：$($_.Exception.Message)" -ForegroundColor Red
    if (-not $passwordChanged) {
        Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
        Write-Host '仍为空密码的新实例已停止。' -ForegroundColor Yellow
    }
    exit 1
}
finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    $plainPassword = $null
}
