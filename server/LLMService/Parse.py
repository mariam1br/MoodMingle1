import LLMService

interests = ['Hiking', 'Basketball', 'Horror Movies', 'Gaming']
location = "Calgary"
weather = 'Rainy, 10 Degrees Celsius'
prompt = LLMService.create_prompt(interests, location, weather)
recommendations = LLMService.query_gemini(prompt)

# Extracting data
outdoor = recommendations.get("outdoor_activities", [])
indoor = recommendations.get("indoor_activities", [])
local_events = recommendations.get("local_events", [])
considerations = recommendations.get("considerations", [])

# Display data cleanly
print("\n🎯 **Recommended Activities:**\n")
if outdoor:
    for activity in outdoor:
        print(activity)
else:
    print("No activities found.")

if indoor:
    for activity in indoor:
        print(activity)
else:
    print("No activities found.")

print("\n🎉 **Local Events:**\n")
if local_events:
    for event in local_events:
        print(event)
else:
    print("No local events found.")

print("\n✅ **Considerations:**\n")
if considerations:
    for tip in considerations:
        print(f"🔹 {tip}")
else:
    print("No special considerations provided.")