import { Image } from "@tiptap/extension-image"
import { mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { ImageNodeView } from "@/components/tiptap-node/image-node/image-node-view"
import {
  isImageAlignment,
  isImageSizePreset,
} from "@/components/tiptap-node/image-node/image-node-options"

export {
  imageAlignments,
  imageSizePresets,
} from "@/components/tiptap-node/image-node/image-node-options"

export const ConfigurableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      imageSize: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("data-image-size")
          return isImageSizePreset(value) ? value : null
        },
        renderHTML: (attributes) =>
          isImageSizePreset(attributes.imageSize)
            ? { "data-image-size": attributes.imageSize }
            : {},
      },
      imageAlignment: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute("data-image-alignment")
          return isImageAlignment(value) ? value : null
        },
        renderHTML: (attributes) =>
          isImageAlignment(attributes.imageAlignment)
            ? { "data-image-alignment": attributes.imageAlignment }
            : {},
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView)
  },

  renderHTML({ HTMLAttributes }) {
    const alignment = isImageAlignment(HTMLAttributes["data-image-alignment"])
      ? HTMLAttributes["data-image-alignment"]
      : "left"

    return [
      "div",
      {
        class: "tiptap-image-wrapper",
        "data-image-wrapper": "",
        "data-image-alignment": alignment,
      },
      [
        "img",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ],
    ]
  },
})
