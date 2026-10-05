export const imageSizePresets = ["small", "medium", "large", "full"] as const
export const imageAlignments = ["left", "center", "right"] as const

export type ImageSizePreset = (typeof imageSizePresets)[number]
export type ImageAlignment = (typeof imageAlignments)[number]

export const isImageSizePreset = (value: unknown): value is ImageSizePreset =>
  typeof value === "string" && imageSizePresets.some((preset) => preset === value)

export const isImageAlignment = (value: unknown): value is ImageAlignment =>
  typeof value === "string" && imageAlignments.some((alignment) => alignment === value)
