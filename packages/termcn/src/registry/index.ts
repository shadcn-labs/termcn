export {
  getRegistry,
  getRegistryItems,
  getTermcnRegistryCatalog,
  resolveRegistryItems,
} from "./api";

export { addRegistryItems, type AddRegistryItemsOptions } from "./add";

export { searchRegistries } from "./search";

export {
  loadRegistry,
  loadRegistryItem,
  type LoadRegistryOptions,
} from "./loader";

export {
  RegistryErrorCode,
  RegistryError,
  RegistryNotFoundError,
  RegistryUnauthorizedError,
  RegistryForbiddenError,
  RegistryFetchError,
  RegistryNotConfiguredError,
  RegistryLocalFileError,
  RegistryParseError,
  RegistryValidationError,
  RegistryItemNotFoundError,
  RegistryMissingEnvironmentVariablesError,
  RegistryInvalidNamespaceError,
} from "./errors";
