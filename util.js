import Table from "cli-table";
import chalk from "chalk";

// Function to improve error messages to reflect that "x-" prefix can be used to retain properties
export const improveErrorMessages = (result) => {
  result.forEach((r) => {
    if (
      r.message === 'Property "host" is not expected to be here.' ||
      r.message === 'Property "basePath" is not expected to be here.' ||
      r.message === 'Property "extraInfo" is not expected to be here.'
    ) {
      r.message =
        r.message + ' You can retain this property by using the "x-" prefix.';
    }
  });
  return result;
};

// Function to log error ouptput
export const logErrorOutput = async (result) => {
  if (result.length > 0) {
    // Output table format for Errors
    const table = new Table({
      head: ["Rule", "Path", "Error Message"],
      style: {
        head: ["cyan"],
        border: ["grey"],
      },
    });

    result.forEach((r) => table.push([r.code, r.path, r.message]));

    console.log(
      chalk.red.bold(result.length) +
      chalk.red(" error(s) found in the API definition\n")
    );

    await new Promise((resolve) => {
      console.log(table.toString());
      resolve();
    });
  }
};

// Function to extract java client output if spectral linter shows no errors for an API definition that the java client identified as errorneous
export const extractJavaClientOutput = async (javaClientOutput) => {
  console.log(javaClientOutput);
};
