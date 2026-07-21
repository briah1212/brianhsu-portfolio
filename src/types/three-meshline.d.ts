import type * as React from "react";

// meshline ships runtime classes (registered via `extend(...)`) but no
// @react-three/fiber JSX bindings. Declare the two custom elements with a
// permissive prop bag so <meshLineGeometry /> / <meshLineMaterial /> accept the
// three.js-style attributes fiber forwards onto the underlying objects.
type MeshLineElementProps = React.RefAttributes<unknown> &
  Record<string, unknown>;

declare module "@react-three/fiber" {
  interface ThreeElements {
    meshLineGeometry: MeshLineElementProps;
    meshLineMaterial: MeshLineElementProps;
  }
}
