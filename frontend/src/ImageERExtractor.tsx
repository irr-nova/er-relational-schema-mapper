import { useState } from "react";

const API_BASE_URL = "https://er-relational-schema-mapper-api.onrender.com";
const STORAGE_KEY = "er-builder-saved-state-v1";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type ExtractedModel = {
  entities: Array<{
    id: string;
    name: string;
    isWeak: boolean;
    attributes: Array<{
      id: string;
      name: string;
      dataType: string;
      isPrimaryKey: boolean;
      isPartialKey: boolean;
    }>;
  }>;
  relationships: Array<{
    id: string;
    name: string;
    entities: string[];
    cardinality: string;
  }>;
};

export default function ImageERExtractor() {
  const [imagePreview, setImagePreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [mimeType, setMimeType] = useState("");
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [modelJson, setModelJson] = useState("");
  const [extractedModel, setExtractedModel] = useState<ExtractedModel | null>(
    null,
  );
  const [warnings, setWarnings] = useState<string[]>([]);

  function chooseImage(file?: File) {
    setMessage("");
    setModelJson("");
    setExtractedModel(null);
    setWarnings([]);

    if (!file) return;

    const supportedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!supportedTypes.includes(file.type)) {
      setMessage("Please choose a PNG, JPG/JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setMessage("Please choose an image smaller than 10 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const commaIndex = dataUrl.indexOf(",");

      if (commaIndex < 0) {
        setMessage("Could not read the image. Please try another file.");
        return;
      }

      setImagePreview(dataUrl);
      setImageBase64(dataUrl.slice(commaIndex + 1));
      setMimeType(file.type);
      setFileName(file.name);
      setMessage("Image ready. Select Extract ER Diagram to analyse it.");
    };

    reader.onerror = () => {
      setMessage("Could not read the image. Please try another file.");
    };

    reader.readAsDataURL(file);
  }

  async function extractDiagram() {
    if (!imageBase64 || !mimeType) {
      setMessage("Choose an ER diagram image first.");
      return;
    }

    setIsExtracting(true);
    setMessage("Analysing the image. This may take a little while.");

    try {
      const response = await fetch(`${API_BASE_URL}/extract-er-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mime_type: mimeType,
          image_base64: imageBase64,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.detail === "string"
            ? result.detail
            : "Image extraction failed. Please try again.",
        );
      }

      if (
        !result.model ||
        !Array.isArray(result.model.entities) ||
        !Array.isArray(result.model.relationships)
      ) {
        throw new Error("The backend returned an invalid ER model.");
      }

      setExtractedModel(result.model);
      setModelJson(JSON.stringify(result.model, null, 2));
      setWarnings(Array.isArray(result.warnings) ? result.warnings : []);
      setMessage(
        "Extraction complete. Review the detected model and correct any mistakes before importing.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not extract the diagram. Please try again.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function importModel() {
    try {
      const model = JSON.parse(modelJson);

      if (
        !model ||
        !Array.isArray(model.entities) ||
        !Array.isArray(model.relationships)
      ) {
        throw new Error(
          "The JSON must contain entities and relationships arrays.",
        );
      }

      if (model.entities.length === 0) {
        throw new Error(
          "No entities were detected. Check the image or edit the JSON first.",
        );
      }

      const entityIds = new Set<string>();

      for (const entity of model.entities) {
        if (
          !entity.id ||
          !entity.name ||
          !Array.isArray(entity.attributes)
        ) {
          throw new Error(
            "Every entity needs an ID, a name, and an attributes array.",
          );
        }

        if (entityIds.has(entity.id)) {
          throw new Error("The model contains duplicate entity IDs.");
        }

        entityIds.add(entity.id);
      }

      for (const relationship of model.relationships) {
        if (
          !relationship.id ||
          !relationship.name ||
          !Array.isArray(relationship.entities) ||
          relationship.entities.length < 2 ||
          relationship.entities.some(
            (entityId: string) => !entityIds.has(entityId),
          )
        ) {
          throw new Error(
            "Each relationship must reference at least two existing entities.",
          );
        }
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          model,
          positions: {},
        }),
      );

      window.location.hash = "er-builder-section";
      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? `Cannot import the model: ${error.message}`
          : "Could not import this model. Check the JSON and try again.",
      );
    }
  }

  return (
    <section className="extras-section" id="diagram-image-upload">
      <p className="extras-kicker">WORK FROM AN EXISTING DIAGRAM</p>
      <h2>Upload an ER Diagram Image</h2>
      <p className="extras-intro">
        Upload a diagram to detect entities, attributes, keys, relationships,
        and cardinalities. Review the extracted model before loading it into
        the ER builder.
      </p>

      <label className="upload-control">
        Choose ER diagram image
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
          onChange={(event) => chooseImage(event.target.files?.[0])}
        />
      </label>

      {fileName && <p className="sample-meta">Selected: {fileName}</p>}

      {imagePreview && (
        <img
          className="diagram-preview"
          src={imagePreview}
          alt="Preview of the uploaded ER diagram"
        />
      )}

      {imagePreview && (
        <div className="extras-actions">
          <button
            type="button"
            onClick={extractDiagram}
            disabled={isExtracting}
          >
            {isExtracting ? "Analysing image..." : "Extract ER Diagram"}
          </button>
        </div>
      )}

      {message && (
        <p className="extractor-message" role="status">
          {message}
        </p>
      )}

      {extractedModel && (
        <div className="extractor-review">
          <h3>Review detected model</h3>
          <p className="sample-meta">
            {extractedModel.entities.length} entities ·{" "}
            {extractedModel.entities.reduce(
              (total, item) => total + item.attributes.length,
              0,
            )}{" "}
            entity attributes · {extractedModel.relationships.length}{" "}
            relationships
          </p>

          <div className="extractor-entity-list">
            {extractedModel.entities.map((item) => (
              <article className="extractor-entity" key={item.id}>
                <strong>{item.name}</strong>
                {item.isWeak && <span> · Weak entity</span>}
                <p>
                  {item.attributes.length
                    ? item.attributes
                        .map(
                          (attribute) =>
                            `${attribute.name}${attribute.isPrimaryKey ? " (PK)" : ""}`,
                        )
                        .join(", ")
                    : "No attributes detected"}
                </p>
              </article>
            ))}
          </div>

          <h4>Detected relationships</h4>
          {extractedModel.relationships.length === 0 ? (
            <p>No relationships were detected. Check the image or edit the JSON.</p>
          ) : (
            <ul>
              {extractedModel.relationships.map((item) => (
                <li key={item.id}>
                  <strong>{item.name}</strong> —{" "}
                  {item.cardinality}
                </li>
              ))}
            </ul>
          )}

          {warnings.length > 0 && (
            <div className="extractor-warnings">
              <strong>Items to verify</strong>
              <ul>
                {warnings.map((warning, index) => (
                  <li key={`${index}-${warning}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <label className="extractor-json-label" htmlFor="extracted-model-json">
            Extracted model JSON (you can edit it before importing)
          </label>
          <textarea
            id="extracted-model-json"
            className="extractor-json"
            value={modelJson}
            onChange={(event) => setModelJson(event.target.value)}
            rows={16}
            spellCheck={false}
          />

          <div className="extras-actions">
            <button type="button" onClick={importModel}>
              Import into ER Builder
            </button>
          </div>
          <p className="sample-meta">
            Check the keys, relationship endpoints, and cardinalities before
            importing. You can continue editing the diagram in the builder.
          </p>
        </div>
      )}
    </section>
  );
}
