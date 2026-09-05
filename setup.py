import os
import subprocess
import sys
import shutil
from pathlib import Path

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
    log(f"Checking for {name}...")
    try:
        result = subprocess.run([command, "--version"], 
                                capture_output=True, 
                                text=True, 
                                shell=True)
        if result.returncode == 0:
            version = result.stdout.strip().split('\n')[0]
            log_success(f"{name} found: {version}")
            return True
        else:
            return False
    except Exception as e:
        return False

def detect_package_manager():
    log("Detecting package manager...")
    if check_dependency("pnpm", "pnpm"):
        return "pnpm"
    if check_dependency("npm", "npm"):
        log_success("npm will be used as the package manager.")
        return "npm"
    log_error("Neither pnpm nor npm was found. Please install Node.js (which includes npm).")
    return None

def check_env_file():
    log("Checking for .env.local...")
    if os.path.exists(".env.local"):
        log_success(".env.local found.")
    else:
        print(f"{Colors.YELLOW}! WARNING: .env.local not found.{Colors.ENDC}")
        print("Please ensure you have configured your BRIGHTDATA_API_KEY and GROQ_API_KEY.")
        # Create a template if it doesn't exist
        with open(".env.local", "w") as f:
            f.write("# Bright Data API Key (Required for web scraping)\nBRIGHTDATA_API_KEY=\n\n# Groq API Key (Required for AI analysis & Chat - https://console.groq.com)\nGROQ_API_KEY=\n\n# Google Gemini API Key (Optional fallback)\nGOOGLE_GENERATIVE_AI_API_KEY=\n")
        log("Created a template .env.local for you.")

# ── EXECUTION ─────────────────────────────────────────────────────────────────

def run_install(pm):
    log(f"Installing dependencies using {pm}...")
    try:
        subprocess.run([pm, "install"], check=True, shell=True)
        log_success("Dependencies installed successfully.")
    except subprocess.CalledProcessError:
        log_error("Failed to install dependencies.")

def run_dev(pm):
    log("Starting development server...")
    try:
        cmd = [pm, "dev"] if pm == "pnpm" else [pm, "run", "dev"]
        subprocess.run(cmd, check=True, shell=True)
    except KeyboardInterrupt:
        log("\nShutting down gracefully...")
    except subprocess.CalledProcessError:
        log_error("Failed to start development server.")

def main():
    print(f"\n{Colors.HEADER}{Colors.BOLD}>>> SEO Insight - Setup & Launch Wizard{Colors.ENDC}\n")
    
    # 1. System Checks
    if not check_dependency("node", "Node.js"):
        log_error("Node.js not found. Please install Node.js from https://nodejs.org/")
    
    pm = detect_package_manager()
    
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

