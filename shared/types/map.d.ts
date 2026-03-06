// MapRef — the public interface exposed by the map component via defineExpose.
export type MapRef = {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
  closePopups: () => void;
  setUserLocation: (lat: number, lng: number) => void;
};
