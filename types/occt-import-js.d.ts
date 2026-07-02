declare module 'occt-import-js' {
  interface OcctBuffer {
    buffer: ArrayBuffer;
  }

  interface OcctMesh {
    index_count: number;
    index: { buffer: OcctBuffer };
    vertex_count: number;
    position: { buffer: OcctBuffer };
    normal: { buffer: OcctBuffer };
    color?: [number, number, number];
  }

  interface OcctResult {
    success: boolean;
    meshes: OcctMesh[];
  }

  export interface OcctModule {
    ReadStepFile(data: Uint8Array, opts: null): OcctResult;
  }

  function init(options: { locateFile: (filename: string) => string }): Promise<OcctModule>;
  export default init;
}
