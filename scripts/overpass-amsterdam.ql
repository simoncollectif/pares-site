[out:json][timeout:120];
area["boundary"="administrative"]["admin_level"="8"]["name"="Amsterdam"]->.a;
(
  way["leisure"="pitch"]["sport"~"soccer|multi"](area.a);
  relation["leisure"="pitch"]["sport"~"soccer|multi"](area.a);
);
out tags geom;
