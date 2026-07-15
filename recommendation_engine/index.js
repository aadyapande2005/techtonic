import {profileQueue} from "./src/profile.queue.js";

async function updateUserProfile(userId) {
    console.log("adding job")
    await profileQueue.add("update-profile", { userId });
    console.log("job completed")
}

