import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemas";
import { getApiVersion, getSanityDataset, getSanityProjectId } from "./src/sanity/env";

export default defineConfig({
  name: "ritualmaker",
  title: "Ritualmaker",
  basePath: "/studio",
  projectId: getSanityProjectId(),
  dataset: getSanityDataset(),
  plugins: [structureTool(), visionTool({ defaultApiVersion: getApiVersion() })],
  schema: { types: schemaTypes },
});
