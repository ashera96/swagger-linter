import * as fs from "node:fs";
import os from "os";
import { oas } from "@stoplight/spectral-rulesets";
import Parsers from "@stoplight/spectral-parsers";
const { Spectral, Document } = spectralCore;
import spectralCore from "@stoplight/spectral-core";
import { spawn } from "child_process";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import chalk from "chalk";
import {
  logErrorOutput,
  extractJavaClientOutput,
  improveErrorMessages,
} from "./util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const jarPath = path.join(
  __dirname,
  "/java-client/apim-swagger-validator-1.0.0.jar"
);

export const validateDefinition = async (
  apiDefinition,
  fileName,
  validationLevel,
  pathToDefinitionForJavaClient = fileName
) => {
  // Run the spectral linter validation
  const myDocument = new Document(apiDefinition, Parsers.Yaml);

  // Load ruleset file depending on the validation level
  let defaultRuleSet = { extends: [oas], rules: {} };

  const spectral = new Spectral();
  spectral.setRuleset(defaultRuleSet);

  // Check if the definition specifies a valid version field
  let versionError = null;
  try {
    const apiData = JSON.parse(apiDefinition);

    const isSwaggerVersionValid = apiData.swagger && apiData.swagger === "2.0";
    const isOpenApiVersionValid =
      apiData.openapi && apiData.openapi.match(/^3\.0\.\d+$/);

    if (!(isSwaggerVersionValid || isOpenApiVersionValid)) {
      // Invalid version field detected
      versionError = {
        code: "invalid-version-field",
        message:
          'The Swagger or OpenAPI version field is not valid. Supported version fields are swagger: "2.0" and those that match openapi: 3.0.n (for example, openapi: 3.0.0).',
        path: [""],
        severity: 0,
      };
    }
  } catch (error) {
    // Version field is not validated if the definition is not a valid json
  }

  if (validationLevel === 1) {
    return spectral.run(myDocument).then(async (result) => {

      if (versionError !== null) {
        result.push(versionError);
      }

      // Run the Java client to validate the API definition
      const pathToDef = "location:" + pathToDefinitionForJavaClient;
      var validationLevelForJavaClient = validationLevel;

      const javaArgs = [
        "-jar",
        jarPath,
        pathToDef,
        validationLevelForJavaClient,
      ];

      const tempFileName = `output-${Date.now()}.txt`; // Generate a unique temporary file name
      const tempFilePath = path.join(os.tmpdir(), tempFileName);
      const writeStream = fs.createWriteStream(tempFilePath);

      const jarProcess = spawn("java", javaArgs);
      jarProcess.stdout.pipe(writeStream);
      jarProcess.stderr.on("data", (data) => {
        console.error(data.toString());
      });

      const javaClientOutput = await new Promise((resolve, reject) => {
        jarProcess.on("close", () => {
          const javaClientStdout = fs.readFileSync(tempFilePath, "utf8"); // Read the contents of the temporary file

          // Analyse java client output to check whether the provided API definition is accepted by API Manager
          let isValid;
          const regex = /Total Successful Files Count (\d+)/;
          const match = javaClientStdout.match(regex);
          if (match) {
            const successfulFileCount = parseInt(match[1], 10);
            successfulFileCount === 1 ? (isValid = true) : (isValid = false);
            fs.unlinkSync(tempFilePath); // Delete the temporary file
            resolve([isValid, javaClientStdout]);
          } else {
            console.log(
              `Failed to get the successful file count from the java client output`
            );
            reject(new Error("Invalid Java client output"));
          }
        });
      });

      const [isValid, javaClientStdout] = await javaClientOutput;

      console.log(
        "\n\u25A1 Validating " +
        fileName +
        " using validation level " +
        validationLevel +
        " ...\n"
      );

      // Iterate the results and select only those with severity of 0 (i.e. errors)
      result = result.filter((r) => r.severity === 0);

      // Replace the path field with a string representation of the path
      result.forEach((r) => (r.path = r.path.join(".")));

      // Remove code, severity and range fields from the result as those add no value to the output
      result.forEach((r) => {
        delete r.severity;
        delete r.range;
      });

      improveErrorMessages(result);

      if (isValid) {
        if (result.length > 0) {
          console.log(
            "\u2757 Validation passed with the below-listed errors/warnings, using may lead to functionality issues. Relaxed Validation enabled mode in API Manager 4.2.0 will " +
            chalk.green("ACCEPT") +
            " this API definition.\n"
          );
        }

        await logErrorOutput(result);

        console.log(chalk.green.bold("\nValidation Passed\n"));
      } else {
        console.log(
          "\u2757 Validation failed with the below-listed errors. Relaxed Validation enabled mode in API Manager 4.2.0 will " +
          chalk.red("NOT ACCEPT") +
          " this API definition.\n"
        );

        console.log(
          chalk.blue("\nAPI Manager Backend validation results : \n")
        );
        extractJavaClientOutput(javaClientStdout);

        if (result.length > 0) {
          console.log(chalk.blue("\nLinter validation results : \n"));
          await logErrorOutput(result);
        }

        console.log(chalk.red.bold("\nValidation Failed\n"));
      }
      return isValid;
    });
  } else {
    return spectral.run(myDocument).then(async (result) => {
      if (versionError !== null) {
        result.push(versionError);
      }

      // Run the Java client to validate the API definition
      const pathToDef = "location:" + pathToDefinitionForJavaClient;
      var validationLevelForJavaClient = validationLevel;

      const javaArgs = [
        "-jar",
        jarPath,
        pathToDef,
        validationLevelForJavaClient,
      ];

      const tempFileName = `output-${Date.now()}.txt`; // Generate a unique temporary file name
      const tempFilePath = path.join(os.tmpdir(), tempFileName);
      const writeStream = fs.createWriteStream(tempFilePath);

      const jarProcess = spawn("java", javaArgs);
      jarProcess.stdout.pipe(writeStream);
      jarProcess.stderr.on("data", (data) => {
        console.error(data.toString());
      });

      const javaClientOutput = await new Promise((resolve, reject) => {
        jarProcess.on("close", () => {
          const javaClientStdout = fs.readFileSync(tempFilePath, "utf8"); // Read the contents of the temporary file

          // Analyse java client output to check whether the provided API definition is accepted by API Manager
          let isValid;
          const regex = /Total Successful Files Count (\d+)/;
          const match = javaClientStdout.match(regex);
          if (match) {
            const successfulFileCount = parseInt(match[1], 10);
            successfulFileCount === 1 ? (isValid = true) : (isValid = false);
            fs.unlinkSync(tempFilePath); // Delete the temporary file
            resolve([isValid, javaClientStdout]);
          } else {
            console.log(
              `Failed to get the successful file count from the java client output`
            );
            reject(new Error("Invalid Java client output"));
          }
        });
      });

      const [isValid, javaClientStdout] = await javaClientOutput;

      console.log(
        "\n\u25A1 Validating " +
        fileName +
        " using validation level " +
        validationLevel +
        " ...\n"
      );

      // Iterate the results and select only those with severity of 0 (i.e. errors)
      result = result.filter((r) => r.severity === 0);

      // Replace the path field with a string representation of the path
      result.forEach((r) => (r.path = r.path.join(".")));

      // Remove code, severity and range fields from the result as those add no value to the output
      result.forEach((r) => {
        delete r.severity;
        delete r.range;
      });

      improveErrorMessages(result);

      if (isValid) {
        if (result.length > 0) {
          console.log(
            "\u2757 Validation passed with the below-listed errors, using may lead to functionality issues. API Manager 4.2.0 will " +
            chalk.green("ACCEPT") +
            " this API definition.\n"
          );
        }

        await logErrorOutput(result);

        console.log(chalk.green.bold("\nValidation Passed\n"));
      } else {
        console.log(
          "\u2757 Validation failed with the below-listed errors. API Manager 4.2.0 will " +
          chalk.red("NOT ACCEPT") +
          " this API definition.\n"
        );

        console.log(
          chalk.blue("\nAPI Manager Backend validation results : \n")
        );
        extractJavaClientOutput(javaClientStdout);

        if (result.length > 0) {
          console.log(chalk.blue("\nLinter validation results : \n"));
          await logErrorOutput(result);
        }

        console.log(chalk.red.bold("\nValidation Failed\n"));
      }
      return isValid;
    });
  }
};
