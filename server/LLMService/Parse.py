import LLMService

interests = ['Hiking', 'Basketball', 'Horror Movies', 'Gaming']
location = "Calgary"
weather = 'Rainy, 10 Degrees Celsius'
prompt = LLMService.create_prompt(interests, location, weather)
recommendations = LLMService.query_gemini(prompt)

# Extracting data
outdoor_indoor = recommendations.get("outdoor_indoor_activities", [])
local_events = recommendations.get("local_events", [])
considerations = recommendations.get("considerations", [])

# Display data cleanly
print("\n🎯 **Recommended Activities:**\n")
if outdoor_indoor:
    for activity in outdoor_indoor:
        print(activity['name'])
        print(activity['description'])
else:
    print("No activities found.")

print("\n🎉 **Local Events:**\n")
if local_events:
    for event in local_events:
        print(event['name'])
        print(event['description'])
else:
    print("No local events found.")

print("\n✅ **Considerations:**\n")
if considerations:
    for tip in considerations:
        print(f"🔹 {tip}")
else:
    print("No special considerations provided.")