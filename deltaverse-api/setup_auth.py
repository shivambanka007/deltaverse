#!/usr/bin/env python3
"""
Setup script for Deltaverse API Firebase Authentication.
Helps configure Firebase credentials and environment variables.
"""

import os
import json
import sys
from pathlib import Path


def create_env_file():
    """Create .env file from .env.example if it doesn't exist."""
    env_example = Path(".env.example")
    env_file = Path(".env")

    if not env_example.exists():
        print("❌ .env.example file not found!")
        return False

    if env_file.exists():
        print("✅ .env file already exists")
        return True

    # Copy .env.example to .env
    with open(env_example, 'r') as src, open(env_file, 'w') as dst:
        dst.write(src.read())

    print("✅ Created .env file from .env.example")
    print("⚠️  Please update the Firebase credentials in .env file")
    return True


def setup_firebase_from_json(json_path: str):
    """Setup Firebase credentials from service account JSON file."""
    if not os.path.exists(json_path):
        print(f"❌ Firebase service account file not found: {json_path}")
        return False

    try:
        with open(json_path, 'r') as f:
            firebase_config = json.load(f)

        # Update .env file with Firebase credentials
        env_file = Path(".env")
        if not env_file.exists():
            print("❌ .env file not found. Run create_env_file() first.")
            return False

        # Read current .env content
        with open(env_file, 'r') as f:
            env_content = f.read()

        # Update Firebase settings
        firebase_settings = {
            'FIREBASE_PROJECT_ID': firebase_config.get(
                'project_id', ''), 'FIREBASE_PRIVATE_KEY_ID': firebase_config.get(
                'private_key_id', ''), 'FIREBASE_PRIVATE_KEY': firebase_config.get(
                'private_key', '').replace(
                    '\n', '\\n'), 'FIREBASE_CLIENT_EMAIL': firebase_config.get(
                        'client_email', ''), 'FIREBASE_CLIENT_ID': firebase_config.get(
                            'client_id', ''), }

        # Replace or add Firebase settings in .env
        lines = env_content.split('\n')
        updated_lines = []
        updated_keys = set()

        for line in lines:
            if '=' in line and not line.strip().startswith('#'):
                key = line.split('=')[0].strip()
                if key in firebase_settings:
                    updated_lines.append(f'{key}={firebase_settings[key]}')
                    updated_keys.add(key)
                else:
                    updated_lines.append(line)
            else:
                updated_lines.append(line)

        # Add any missing Firebase settings
        for key, value in firebase_settings.items():
            if key not in updated_keys:
                updated_lines.append(f'{key}={value}')

        # Write updated .env file
        with open(env_file, 'w') as f:
            f.write('\n'.join(updated_lines))

        print("✅ Firebase credentials updated in .env file")
        return True

    except Exception as e:
        print(f"❌ Error setting up Firebase credentials: {str(e)}")
        return False


def install_dependencies():
    """Install required dependencies."""
    print("📦 Installing dependencies...")

    try:
        import subprocess
        result = subprocess.run([sys.executable,
                                 "-m",
                                 "pip",
                                 "install",
                                 "-r",
                                 "requirements.txt"],
                                capture_output=True,
                                text=True)

        if result.returncode == 0:
            print("✅ Dependencies installed successfully")
            return True
        else:
            print(f"❌ Error installing dependencies: {result.stderr}")
            return False

    except Exception as e:
        print(f"❌ Error installing dependencies: {str(e)}")
        return False


def generate_jwt_secret():
    """Generate a secure JWT secret key."""
    import secrets
    import string

    # Generate a 64-character random string
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    jwt_secret = ''.join(secrets.choice(alphabet) for _ in range(64))

    # Update .env file
    env_file = Path(".env")
    if not env_file.exists():
        print("❌ .env file not found")
        return False

    with open(env_file, 'r') as f:
        content = f.read()

    # Replace JWT_SECRET_KEY
    lines = content.split('\n')
    updated_lines = []
    jwt_updated = False

    for line in lines:
        if line.startswith('JWT_SECRET_KEY='):
            updated_lines.append(f'JWT_SECRET_KEY={jwt_secret}')
            jwt_updated = True
        else:
            updated_lines.append(line)

    if not jwt_updated:
        updated_lines.append(f'JWT_SECRET_KEY={jwt_secret}')

    with open(env_file, 'w') as f:
        f.write('\n'.join(updated_lines))

    print("✅ JWT secret key generated and updated")
    return True


def main():
    """Main setup function."""
    print("🚀 Setting up Deltaverse API Firebase Authentication")
    print("=" * 50)

    # Step 1: Create .env file
    if not create_env_file():
        return

    # Step 2: Install dependencies
    if not install_dependencies():
        return

    # Step 3: Generate JWT secret
    if not generate_jwt_secret():
        return

    # Step 4: Setup Firebase (optional)
    firebase_json = input(
        "\n📁 Enter path to Firebase service account JSON file (optional, press Enter to skip): ").strip()
    if firebase_json:
        setup_firebase_from_json(firebase_json)

    print("\n" + "=" * 50)
    print("✅ Setup completed!")
    print("\n📝 Next steps:")
    print("1. Update Firebase credentials in .env file if not done already")
    print("2. Set up your Firebase project with Authentication enabled")
    print("3. Enable Phone and Google sign-in methods in Firebase Console")
    print("4. Run the application: uvicorn app.main:app --reload")
    print("\n🔗 Useful links:")
    print("- Firebase Console: https://console.firebase.google.com/")
    print("- API Documentation: http://localhost:8000/docs (after starting the server)")


if __name__ == "__main__":
    main()
