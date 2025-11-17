export default {
	Geometry: {
		parse: () => ({
			toGeoJSON: () => ({ type: 'Point', coordinates: [0, 0] })
		})
	}
};
