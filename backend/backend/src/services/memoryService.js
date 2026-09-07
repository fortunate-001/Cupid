// src/services/memoryService.js

import Memory from "../models/Memory.js";
/**
 * Save or update a memory.
 */
export async function saveMemory(
  userId,
  key,
  value,
  category = "general",
  importance = 5,
  sourceMessage = ""
) {
  try {
    const memory = await Memory.findOneAndUpdate(
      {
        userId,
        key: key.toLowerCase(),
      },
      {
        value,
        category,
        importance,
        sourceMessage,
        active: true,
      },
      {
        new: true,
        upsert: true,
      }
    );

    return memory;
  } catch (error) {
    console.error("❌ saveMemory:", error);
    return null;
  }
}

/**
 * Find one memory.
 */
export async function getMemory(userId, key) {
  try {
    return await Memory.findOne({
      userId,
      key: key.toLowerCase(),
      active: true,
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Get every memory.
 */
export async function getAllMemories(userId) {
  try {
    return await Memory.find({
      userId,
      active: true,
    }).sort({
      importance: -1,
      updatedAt: -1,
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Delete a memory.
 */
export async function deleteMemory(userId, key) {
  try {
    await Memory.findOneAndDelete({
      userId,
      key: key.toLowerCase(),
    });

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Search memories.
 */
export async function searchMemories(userId, text) {
  try {
    return await Memory.find({
      userId,
      active: true,
      $or: [
        {
          key: {
            $regex: text,
            $options: "i",
          },
        },
        {
          value: {
            $regex: text,
            $options: "i",
          },
        },
      ],
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}