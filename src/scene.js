import { Sphere, DirectionalLight, Plane, Camera} from './Object';
import { Vec3 } from './RMath';
import { Material, diffuseBRDF, reflectionBRDF, emissionBRDF } from './Shading';

export let camera = new Camera();
export let objects = [];


// Cornell box
let material = new Material(reflectionBRDF, { baseColor: new Vec3(1, 1, 1) });
let sphere = new Sphere(new Vec3(-2, -3, 1), 2, material);
objects.push(sphere);

material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 1, 0) });
sphere = new Sphere(new Vec3(2, -3, -1), 2, material);
objects.push(sphere);

material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 0, 0) });
let plane = new Plane(new Vec3(5, 5, 5), new Vec3(0, 0, -10), new Vec3(0, -10, 0), material);
objects.push(plane);
material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 1, 1) });
plane = new Plane(new Vec3(5, 5, 5), new Vec3(-10, 0, 0), new Vec3(0, -10, 0), material);
objects.push(plane);
material = new Material(diffuseBRDF, { baseColor: new Vec3(0, 1, 0) });
plane = new Plane(new Vec3(-5, 5, 5), new Vec3(0, 0, -10), new Vec3(0, -10, 0), material);
objects.push(plane);
material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 1, 1) });
plane = new Plane(new Vec3(5, -5, 5), new Vec3(-10, 0, 0), new Vec3(0, 0, -10), material);
objects.push(plane);

material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 1, 1) });
plane = new Plane(new Vec3(5, 5, 5), new Vec3(-10, 0, 0), new Vec3(0, 0, -3), material);
objects.push(plane);
plane = new Plane(new Vec3(5, 5, -2), new Vec3(-10, 0, 0), new Vec3(0, 0, -3), material);
objects.push(plane);
plane = new Plane(new Vec3(5, 5, 2), new Vec3(-3, 0, 0), new Vec3(0, 0, -4), material);
objects.push(plane);
plane = new Plane(new Vec3(-2, 5, 2), new Vec3(-3, 0, 0), new Vec3(0, 0, -4), material);
objects.push(plane);

material = new Material(emissionBRDF, { baseColor: new Vec3(8, 8, 8) });
plane = new Plane(new Vec3(2, 5, 2), new Vec3(-4, 0, 0), new Vec3(0, 0, -4), material);
objects.push(plane);


// HO
// let material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 1, 1) });
// let sphere = new Sphere(new Vec3(-3, 0, 0), 3, material);
// objects.push(sphere);
// material = new Material(diffuseBRDF, { baseColor: new Vec3(1, 0, 0) });
// sphere = new Sphere(new Vec3(3, 0, 0), 3, material);
// objects.push(sphere);

// let light = new DirectionalLight(new Vec3(1, -1, -1), new Vec3(1, 1, 1));
// objects.push(light);

camera.setView(new Vec3(0, 0, -10), new Vec3(0, 0, 0), new Vec3(0, 1, 0));
camera.focus = 5;