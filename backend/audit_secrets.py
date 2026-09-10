import os
import re

frontend_dir = r"C:\Users\user\.gemini\antigravity\scratch\medikiosk\src"
dist_dir = r"C:\Users\user\.gemini\antigravity\scratch\medikiosk\dist"

secrets = [
    "TWILIO_AUTH_TOKEN",
    "TWILIO_ACCOUNT_SID",
    "SUPABASE_SERVICE_ROLE_KEY",
    "GOOGLE_MAPS_API_KEY",
    "VITE_TWILIO",
    "VITE_SUPABASE_SERVICE"
]

found = []

for folder in [frontend_dir, dist_dir]:
    if not os.path.exists(folder):
        continue
    for root, dirs, files in os.walk(folder):
        for f in files:
            if f.endswith(('.js', '.jsx', '.html', '.css')):
                filepath = os.path.join(root, f)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
                    content = fp.read()
                    for s in secrets:
                        if s in content:
                            found.append((filepath, s))

print(f"Audit completed. Found secrets count: {len(found)}")
for item in found:
    print(f"SECRET LEAK FOUND: {item[0]} -> {item[1]}")
