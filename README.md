# quai

quai is a GPU rendering library for user interfaces. Use it anywhere interaction is needed: lightweight games, data visualization, or silky smooth interfaces. 

It has no external dependencies and exposes a set of objects to compose your own 3d rendering pipelines. Mouse clicks are sampled in screen space against framebuffer output so interaction works even after a chain of fragment shader distortions - no logic for object selection, raytracing or transformation is needed CPU side.

It provides objects to compose backend shader programs, vertex buffers, framebuffers, renderers and textures with Frontend objects for meshes, 3d objects, fonts and animations. At its heart is RenderContext and RenderLayer which are used to define render pipelines from your objects that stream efficiently to the GPU.