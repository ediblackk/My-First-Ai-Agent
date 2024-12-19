@echo off
setlocal EnableDelayedExpansion
echo [%time%] Starting Git backup process...

:: Change to project directory
cd /d "%~dp0"
echo [%time%] Working directory: %CD%

:: Check if git is initialized
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo [%time%] Git repository not found
    
    :: Get Git user info
    set /p GIT_NAME="Enter your Git username: "
    set /p GIT_EMAIL="Enter your Git email: "
    set /p REPO_URL="Enter your Git repository URL (e.g., https://github.com/username/repo.git): "
    
    if "!GIT_NAME!"=="" (
        echo [%time%] Error: Git username is required
        goto :error
    )
    if "!GIT_EMAIL!"=="" (
        echo [%time%] Error: Git email is required
        goto :error
    )
    if "!REPO_URL!"=="" (
        echo [%time%] Error: Repository URL is required
        goto :error
    )
    
    echo [%time%] Configuring Git...
    git config user.name "!GIT_NAME!" || goto :error
    git config user.email "!GIT_EMAIL!" || goto :error
    
    echo [%time%] Initializing Git repository...
    git init || goto :error
    
    echo [%time%] Adding remote origin...
    git remote add origin !REPO_URL! || goto :error
    
    echo [%time%] Creating initial commit...
    git add . || goto :error
    git commit -m "Initial commit" || goto :error
    
    echo [%time%] Creating main branch...
    git branch -M main || goto :error
    
    echo [%time%] Pushing to remote...
    git push -u origin main || goto :error
)

:: Check current branch
for /f "tokens=*" %%a in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%a
if not "%current_branch%"=="main" (
    echo [%time%] Switching to main branch...
    git checkout main || goto :error
)

:: Check for uncommitted changes
git diff-index --quiet HEAD -- >nul 2>&1
if %errorlevel% neq 0 (
    echo [%time%] Warning: You have uncommitted changes
    choice /C YN /M "Do you want to continue?"
    if !errorlevel! neq 1 goto :error
)

:: Format date and time properly
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%

:: Check if version file exists
if exist version.txt (
    set /p VERSION=<version.txt
    echo [%time%] Current version: %VERSION%
) else (
    set VERSION=1.0
    echo [%time%] Starting at version: %VERSION%
)

:: Create backup branch name
set BACKUP_BRANCH=backup/v%VERSION%_%TIMESTAMP%
echo [%time%] Creating backup branch: %BACKUP_BRANCH%

:: Create backup using Git
echo [%time%] Saving current changes...
git add . || goto :error
git commit -m "Backup v%VERSION% at %TIMESTAMP%" || goto :error

echo [%time%] Creating backup branch...
git checkout -b %BACKUP_BRANCH% || goto :error

echo [%time%] Creating version tag...
git tag -a v%VERSION% -m "Version %VERSION% backup at %TIMESTAMP%" || goto :error

echo [%time%] Pushing backup to remote...
git push origin %BACKUP_BRANCH% || goto :error
git push origin v%VERSION% || goto :error

echo [%time%] Returning to main branch...
git checkout main || goto :error

:: Increment version
for /f "tokens=1,2 delims=." %%a in ("%VERSION%") do (
    set /a NEW_MINOR=%%b+1
    set NEW_VERSION=%%a.!NEW_MINOR!
)
echo [%time%] New version: !NEW_VERSION!

:: Save new version
echo !NEW_VERSION!>version.txt

echo [%time%] Backup complete!
echo [%time%] Created branch: %BACKUP_BRANCH%
echo [%time%] Created tag: v%VERSION%
goto :end

:error
echo [%time%] An error occurred during backup
pause
exit /b 1

:end
echo [%time%] All done!
pause
endlocal
