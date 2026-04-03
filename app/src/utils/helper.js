const FALLBACK_PHOTO_URL = "https://static.tildacdn.com/stor3632-6331-4263-b262-666333346564/53487197.png";

export const getIconSize = (zoom) => {
    if (zoom >= 15) return [80, 80];
    if (zoom >= 12) return [60, 60];
    if (zoom >= 9)  return [40, 40];
    if (zoom >= 6)  return [30, 30];
    return [20, 20];
};

export const getPhotoUrl = (photo) => {
    if (photo && photo.photo_path) {
        return `https://bc109a6da9ed.hosting.myjino.ru${photo.photo_path}`;
    }
    return FALLBACK_PHOTO_URL;
};
