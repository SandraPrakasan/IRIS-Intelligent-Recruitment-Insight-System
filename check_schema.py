
import os
from dotenv import load_dotenv
from supabase import create_client

# adjust path if needed to find .env
load_dotenv(dotenv_path="backend/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY")

if not url or not key:
    print("Missing credentials")
else:
    try:
        sb = create_client(url, key)
        resp = sb.table("jobs").select("*").limit(1).execute()
        if resp.data:
            print("Columns:", list(resp.data[0].keys()))
        else:
            # If no data, try to insert dummy and fail or just print empty
            print("Table accessed but no data found. Cannot deduce columns easily without data.")
            # Trying to get an error message that lists columns
            try:
                sb.table("jobs").select("non_existent_column").limit(1).execute()
            except Exception as e:
                print("Error might reveal columns:", e)

    except Exception as e:
        print("Error:", e)
