[out:json][timeout:120];
area["boundary"="administrative"]["admin_level"="8"]["name"="Amsterdam"]->.a;
relation["boundary"="administrative"]["admin_level"="9"](area.a);
out tags geom;
