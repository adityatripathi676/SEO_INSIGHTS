import os
import subprocess
import sys
import shutil
from pathlib import Path

# ── ANSI COLOR SUPPORT (enable on Windows) ────────────────────────────────────
if sys.platform == "win32":
    import ctypes
    kernel32 = ctypes.windll.kernel32
    # Enable ENABLE_VIRTUAL_TERMINAL_PROCESSING (0x0004) on stdout
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

# ── DESIGN TOKENS ─────────────────────────────────────────────────────────────
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(msg, color=Colors.BLUE):
    print(f"{color}{Colors.BOLD}>> {msg}{Colors.ENDC}")

def log_success(msg):
    print(f"{Colors.GREEN}[OK] {msg}{Colors.ENDC}")

def log_error(msg):
    print(f"{Colors.RED}[ERROR] {msg}{Colors.ENDC}")
    input("\nPress Enter to exit...")
    sys.exit(1)

# ── CHECKS ────────────────────────────────────────────────────────────────────

def check_dependency(command, name):
    """Check if a CLI tool is available. Uses shell=False with a string command
    to avoid the Windows shell=True+list pitfall."""
    log(f"Checking for {name}...")
    try:
        # Use shutil.which to resolve the full path first — avoids shell=True issues
        cmd_path = shutil.which(command)
        if cmd_path is None:
            return False
        result = subprocess.run(
            [cmd_path, "--version"],
            capture_output=True,
            text=True,
            shell=False  # FIXED: never combine shell=True with a list on Windows
        )
        if result.returncode == 0:
            version = result.stdout.strip().split('\n')[0] or result.stderr.strip().split('\n')[0]
            log_success(f"{name} found: {version}")
            return True
        return False
    except Exception as e:
        log(f"  Could not detect {name}: {e}", color=Colors.YELLOW)
        return False

def detect_package_manager():
    log("Detecting package manager...")
    if check_dependency("pnpm", "pnpm"):
        return "pnpm"
    if check_dependency("npm", "npm"):
        log_success("npm will be used as the package manager.")
        return "npm"
    # FIXED: was returning None silently — now hard-fails with a clear message
    log_error("Neither pnpm nor npm was found. Please install Node.js (which includes npm) from https://nodejs.org/")

def check_env_file():
    log("Checking for .env.local...")
    if os.path.exists(".env.local"):
        log_success(".env.local found.")
    else:
        print(f"{Colors.YELLOW}! WARNING: .env.local not found.{Colors.ENDC}")
        print("Please ensure you have configured your BRIGHTDATA_API_KEY and GROQ_API_KEY.")
        with open(".env.local", "w") as f:
            f.write(
                "# Bright Data API Key (Required for web scraping)\n"
                "BRIGHTDATA_API_KEY=\n\n"
                "# Groq API Key (Required for AI analysis & Chat - https://console.groq.com)\n"
                "GROQ_API_KEY=\n\n"
                "# Google Gemini API Key (Optional fallback)\n"
                "GOOGLE_GENERATIVE_AI_API_KEY=\n"
            )
        log("Created a template .env.local for you. Fill in your API keys before starting.")

# ── EXECUTION ─────────────────────────────────────────────────────────────────

def run_install(pm):
    log(f"Installing dependencies using {pm}...")
    pm_path = shutil.which(pm)
    if not pm_path:
        log_error(f"Could not locate '{pm}' executable.")
    try:
        # FIXED: shell=False + resolved full path — works correctly on Windows
        subprocess.run([pm_path, "install"], check=True, shell=False)
        log_success("Dependencies installed successfully.")
    except subprocess.CalledProcessError:
        log_error("Failed to install dependencies. Check the output above for details.")

def run_dev(pm):
    log("Starting development server...")
    pm_path = shutil.which(pm)
    if not pm_path:
        log_error(f"Could not locate '{pm}' executable.")
    try:
        # FIXED: both pnpm and npm need "run dev" — pnpm also supports "pnpm run dev"
        cmd = [pm_path, "run", "dev"]
        subprocess.run(cmd, check=True, shell=False)
    except KeyboardInterrupt:
        log("\nShutting down gracefully...")
    except subprocess.CalledProcessError:
        log_error("Failed to start development server. Check the output above for details.")

def main():
    print(f"\n{Colors.HEADER}{Colors.BOLD}>>> SEO Insight - Setup & Launch Wizard{Colors.ENDC}\n")

    # 1. System Checks
    if not check_dependency("node", "Node.js"):
        log_error("Node.js not found. Please install Node.js from https://nodejs.org/")

    pm = detect_package_manager()  # guaranteed non-None (exits on failure)

    # 2. Config Checks
    check_env_file()

    # 3. Installation
    run_install(pm)

    # 4. Launch
    print(f"\n{Colors.GREEN}{Colors.BOLD}* Everything is ready!{Colors.ENDC}")
    print(f"{Colors.BLUE}The application will now launch on http://localhost:3000{Colors.ENDC}\n")

    run_dev(pm)

    input("\nProcess finished. Press Enter to exit...")

if __name__ == "__main__":
    main()
