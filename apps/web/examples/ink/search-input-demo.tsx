import { SearchInput } from "@/registry/bases/ink/ui/search-input";

export default function SearchInputDemo() {
  return (
    <SearchInput
      autoFocus
      label="Search Packages"
      options={["react", "vue", "svelte", "angular", "solid"]}
      placeholder="Search..."
    />
  );
}
