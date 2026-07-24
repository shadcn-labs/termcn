/**
 * Web preview: OpenTUI files use @jsxImportSource @opentui/react, which expects
 * this subpath. Re-export React's automatic runtime so Next/Turbopack can bundle.
 */
export { Fragment, jsx, jsxs } from "react/jsx-runtime";
