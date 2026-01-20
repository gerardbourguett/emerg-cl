// Hardcoded Albergues data based on official SENAPRED information
// Coordinates provided by user

export interface Albergue {
    id: string;
    nombre: string;
    direccion: string;
    comuna: string;
    region: string;
    lat: number;
    lng: number;
}

export const ALBERGUES_DATA: Albergue[] = [
    // Región de Ñuble
    {
        id: "alb-1",
        nombre: "Escuela Básica de Ñipas",
        direccion: "Manuel Matta 440",
        comuna: "Ránquil",
        region: "Ñuble",
        lat: -36.6058858102268,
        lng: -72.53336917405566,
    },
    {
        id: "alb-2",
        nombre: "Anexo Liceo Santa Cruz de Larqui",
        direccion: "Carlos Palacios 488",
        comuna: "Bulnes",
        region: "Ñuble",
        lat: -36.74303834548532,
        lng: -72.29906965425008,
    },
    {
        id: "alb-3",
        nombre: "Escuela Amanda Chávez",
        direccion: "18 de septiembre 899",
        comuna: "Quillón",
        region: "Ñuble",
        lat: -36.75284558947313,
        lng: -72.47542974390878,
    },
    {
        id: "alb-4",
        nombre: "Escuela Marta Colvin Andrade",
        direccion: "Baquedano 1654",
        comuna: "Coihueco",
        region: "Ñuble",
        lat: -36.630405882046105,
        lng: -71.8363676076647,
    },
    {
        id: "alb-5",
        nombre: "Liceo Bicentenario de Trehuaco",
        direccion: "Gonzalo Urrejola 870",
        comuna: "Trehuaco",
        region: "Ñuble",
        lat: -36.43186899467251,
        lng: -72.66975289209762,
    },
    {
        id: "alb-6",
        nombre: "Liceo Nibaldo Sepúlveda Fernández",
        direccion: "San Martín 386",
        comuna: "Portezuelo",
        region: "Ñuble",
        lat: -36.527688026632525,
        lng: -72.42958464413066,
    },
    // Región de Biobío
    {
        id: "alb-7",
        nombre: "Liceo Domingo Santa María",
        direccion: "Santa María 2350",
        comuna: "Concepción",
        region: "Biobío",
        lat: -36.81271499207681,
        lng: -73.03361219152289,
    },
    {
        id: "alb-8",
        nombre: "Liceo Pencopolitano",
        direccion: "San Vicente 51",
        comuna: "Penco",
        region: "Biobío",
        lat: -36.73848254950804,
        lng: -73.00049046322404,
    },
    {
        id: "alb-9",
        nombre: "Escuela Isla de Pascua",
        direccion: "Heras 485",
        comuna: "Penco",
        region: "Biobío",
        lat: -36.738036422077684,
        lng: -72.9938590776102,
    },
    {
        id: "alb-10",
        nombre: "Colegio Italia",
        direccion: "Roberto Ovalle 02",
        comuna: "Penco",
        region: "Biobío",
        lat: -36.742257887714686,
        lng: -72.9999207730982,
    },
    {
        id: "alb-11",
        nombre: "Liceo Comercial de Tomé",
        direccion: "Sgto. Aldea 1050",
        comuna: "Tomé",
        region: "Biobío",
        lat: -36.614202194402935,
        lng: -72.95665696358601,
    },
    {
        id: "alb-12",
        nombre: "Liceo República del Ecuador",
        direccion: "Aníbal Pinto 1210",
        comuna: "Tomé",
        region: "Biobío",
        lat: -36.61625852662059,
        lng: -72.95316206530129,
    },
    {
        id: "alb-13",
        nombre: "Liceo Héroes de la Concepción",
        direccion: "Baquedano 273",
        comuna: "Laja",
        region: "Biobío",
        lat: -37.27842673105918,
        lng: -72.71297449679034,
    },
    {
        id: "alb-14",
        nombre: "Palacio del Deporte",
        direccion: "Arturo Prat 88",
        comuna: "Talcahuano",
        region: "Biobío",
        lat: -36.71973948985093,
        lng: -73.10884355799901,
    },
];

export const EMERGENCY_NUMBERS = [
    { label: "CONAF", number: "130" },
    { label: "Ambulancia", number: "131" },
    { label: "Bomberos", number: "132" },
    { label: "Carabineros", number: "133" },
    { label: "PDI", number: "134" },
    { label: "SEC (Electricidad)", number: "+56 2 2712 7000" },
    { label: "SISS (Agua)", number: "800 381 800" },
    { label: "Electrodependientes", number: "800 600 803" },
];
