## API Definition Validator

- npm package to validate Swagger definitions or OpenAPI definitions

You can validate API definition(s) using either validation level 1 or 2;
- **Validation level 1**: validate API definition(s) as in WSO2 API Manager 4.0.0
- **Validation level 2**: Fully validate API definition(s)

## Usage

Clone this repo and run the following commnds

`npm i`

`npm link`

Validate provided Swagger or OpenAPI definition

`swagger-linter -f [path to API definition JSON or YAML] -l [validation level 1 or 2]`

or

Validate a directory of Swagger definitions and/or OpenAPI definitions

`swagger-linter -d [path to directory with API definitions] -l [validation level 1 or 2]`

#### Ignored validation rules for level 1

- host (oas2-schema): "host" property must match pattern "^[^{}/ :\\]+(?::\d+)?$".
- host (oas3-schema): Property "host" is not expected to be here
- basePath (oas2-schema): "basePath" property must match pattern "^/".
- basePath (oas3-schema): Property "basePath" is not expected to be here.
- oas2-discriminator: The discriminator property must be in the required property list. 
- operation-operationId-unique: Every operation must have unique "operationId".
- oas2-valid-schema-example: "example" property type must be object
- oas2-schema: "x" property must have required property "schema".
- oas2-schema: "x" property must have required property "name".
- oas2-schema: "email" property must match format "email".
- oas2-schema: "Property "x" is not expected to be here."
- oas2-schema: "get" property must have required property "responses".
- oas2-schema: "post" property must have required property "responses".
- oas2-schema: "put" property must have required property "responses".
- oas2-schema: Invalid security securityDefinitions.
- oas2-schema: "x" property must have required property "description".
- oas2-schema: "x" property must not have duplicate items (items ## y and z are identical).
- oas2-schema: "responses" property must not be valid.
- oas2-schema: "x" property must be equal to one of the allowed values.
- oas2-schema: "type" property must be equal to one of the allowed values: "array", "boolean", "integer", "null", "number", "object", "string". Did you mean "array"?.
- oas2-schema: "schema" property must have required property "type".
