import httpx
import asyncio
import json

API_BASE = "http://localhost:8000/api/v1/hazards"

async def verify():
    print("--- Verifying Redis Hazard Integration ---")
    
    async with httpx.AsyncClient() as client:
        # 1. List hazards to get one
        print("Fetching hazard list...")
        try:
            res = await client.get(f"{API_BASE}/")
        except Exception as e:
            print(f"Failed to connect to API: {e}")
            return

        hazards = res.json()
        if not hazards:
            print("No hazards found. Please create one in the simulator first.")
            return

        hazard = hazards[0]
        hazard_id = hazard['id']
        hex_index = hazard['hex_index'][0]
        print(f"Testing with Hazard ID: {hazard_id}, Hex: {hex_index}")

        # 2. Ensure it's inactive first (for a clean test)
        if hazard['is_active']:
            print("Deactivating hazard for clean test...")
            await client.patch(f"{API_BASE}/{hazard_id}/toggle")
        
        # 3. Check /check endpoint (should be False)
        print(f"Checking status for {hex_index} (Expected: False)...")
        res = await client.get(f"{API_BASE}/check/{hex_index}")
        print(f"Result: {res.json()}")

        # 4. Activate hazard
        print("Activating hazard...")
        res = await client.patch(f"{API_BASE}/{hazard_id}/toggle")
        if res.status_code != 200:
            print(f"Failed to toggle: {res.text}")
            return
        
        # 5. Check /check endpoint (should be True)
        print(f"Checking status for {hex_index} (Expected: True)...")
        res = await client.get(f"{API_BASE}/check/{hex_index}")
        print(f"Result: {res.json()}")

        # 6. Deactivate hazard
        print("Deactivating hazard...")
        await client.patch(f"{API_BASE}/{hazard_id}/toggle")

        # 7. Check /check endpoint (should be False)
        print(f"Checking status for {hex_index} (Expected: False)...")
        res = await client.get(f"{API_BASE}/check/{hex_index}")
        print(f"Result: {res.json()}")

if __name__ == "__main__":
    asyncio.run(verify())
