import {
  AlignCenter,
  AlignLeft,
  AlignRight,
} from "lucide-react"
import type { NodeViewProps } from "@tiptap/react"
import { NodeViewWrapper } from "@tiptap/react"
import {
  imageAlignments,
  imageSizePresets,
} from "@/components/tiptap-node/image-node/image-node-options"

const alignmentIcons = {
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
}

const sizeLabels = {
  small: "S",
  medium: "M",
  large: "L",
  full: "Full",
}

export function ImageNodeView({
  node,
  selected,
  updateAttributes,
}: NodeViewProps) {
  const imageSize = node.attrs.imageSize
  const imageAlignment = node.attrs.imageAlignment || "left"

  return (
    <NodeViewWrapper
      as="div"
      className="tiptap-image-wrapper"
      data-image-wrapper=""
      data-image-alignment={imageAlignment}
      contentEditable={false}
    >
      {selected && (
        <div
          className="image-node-toolbar"
          contentEditable={false}
          role="toolbar"
          aria-label="Image formatting"
        >
          <div className="image-node-toolbar-group" aria-label="Image size">
            {imageSizePresets.map((size) => (
              <button
                key={size}
                type="button"
                className="image-node-toolbar-button"
                data-active={imageSize === size}
                aria-label={`Set image size to ${size}`}
                aria-pressed={imageSize === size}
                title={size === "full" ? "Full width" : size}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => updateAttributes({ imageSize: size })}
              >
                {sizeLabels[size]}
              </button>
            ))}
          </div>

          <span className="image-node-toolbar-divider" aria-hidden="true" />

          <div
            className="image-node-toolbar-group"
            aria-label="Image placement"
          >
            {imageAlignments.map((alignment) => {
              const Icon = alignmentIcons[alignment]
              const isActive = imageAlignment === alignment

              return (
                <button
                  key={alignment}
                  type="button"
                  className="image-node-toolbar-button image-node-toolbar-icon-button"
                  data-active={isActive}
                  aria-label={`Align image ${alignment}`}
                  aria-pressed={isActive}
                  title={`Align ${alignment}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    updateAttributes({ imageAlignment: alignment })
                  }
                >
                  <Icon aria-hidden="true" size={16} />
                </button>
              )
            })}
          </div>
        </div>
      )}

      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ""}
        title={node.attrs.title || undefined}
        width={node.attrs.width || undefined}
        height={node.attrs.height || undefined}
        data-image-size={imageSize || undefined}
        data-image-alignment={imageAlignment}
        draggable={false}
      />
    </NodeViewWrapper>
  )
}
