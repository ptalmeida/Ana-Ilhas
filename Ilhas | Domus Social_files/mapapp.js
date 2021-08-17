// Parametros comuns a todos os mapas
var MAXZOOMLEVEL = 19
var MAPCTRL = null

var TILED_BASEMAP_LAYERS = {
    ORTOIMG: {
        label: "Ortoimagem",
        url: 'http://mipweb.cm-porto.pt/agol/{z}/{x}/{y}.jpg',
        esri: false,
        minZoom: 12,
        maxZoom: 17,
        attribution: "<a href='https://www.arcgis.com/home/item.html?id=64f2ff721fe744f3ad47497cf149b863'>ESRI</a>"
    },
    TEMASBASE: {
        label: "Temas base",
        url: 'https://mipweb.cm-porto.pt/arcgis/rest/services/Cache/CACHE_INFO_BASE_XPL4/MapServer',
        esri: true,
        minZoom: 14,
        maxZoom: MAXZOOMLEVEL,
        attribution: "C.M.Porto"
    }
}


var INSTANCED_LAYERS = []
var MERGE_BASEMAP_LAYERS = true

// ----------------------------------------------------------------

var GlobalSwitchCases = {};

function finishEvent(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true;
    }
    if (e.preventDefault) {
        e.preventDefault();
    }
    return false;
}

if (!String.format) {
    String.format = function (format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ?
                args[number] :
                match;
        });
    };
}

function getIconCfg(p_idx, p_lyrkey, p_cfgico) {

    cfgicoobj = {}, requiredcount = 0;
    for (var kcfgico in p_cfgico) {
        if (!p_cfgico.hasOwnProperty(kcfgico)) {
            continue;
        }
        switch (kcfgico) {
            case "url":
                cfgicoobj.iconUrl = p_cfgico[kcfgico];
                requiredcount++;
                break;
            case "size":
                cfgicoobj.iconSize = p_cfgico[kcfgico];
                requiredcount++;
                break;
            case "anchor":
                cfgicoobj.iconAnchor = p_cfgico[kcfgico];
                break;
            default:
                cfgicoobj[kcfgico] = p_cfgico[kcfgico];

        }
    }

    if (requiredcount < 2) {
        if (console) {
            console.warn("Icon n." + (p_idx + 1) + " do tema '" + p_lyrkey + "' nÃ£o tem os atributos mÃ­nimos requeridos.");
        }
        return null;
    } else {
        return cfgicoobj;
    }

}

function getPolyCfg(p_idx, p_lyrkey, p_cfg) {

    cfgobj = {}, requiredcount = 0;
    for (var kcfg in p_cfg) {
        if (!p_cfg.hasOwnProperty(kcfg)) {
            continue;
        }
        switch (kcfg) {
            case "url":
                cfgobj.url = p_cfg[kcfg];
                requiredcount++;
                break;
            case "styleFunc":
                cfgobj.style = p_cfg[kcfg];
                requiredcount++;
                break;
            case "simplify":
                cfgobj.simplifyFactor = p_cfg[kcfg];
                break;
            case "precision":
                cfgobj.precision = p_cfg[kcfg];
                break;
            default:
                cfgobj[kcfg] = p_cfg[kcfg];

        }
    }

    if (requiredcount < 2) {
        if (console) {
            console.warn("Classe poligono n." + (p_idx + 1) + " do tema '" + p_lyrkey + "' nÃ£o tem os atributos mÃ­nimos requeridos.");
        }
        return null;
    } else {
        return cfgobj;
    }

}

function clickfunc(e, p_tpopobj) {

    var urls, url = null,
        keyv, props = e.sourceTarget.feature.properties;

    if (props.objectid) {
        setTimeout(() => {
            MAPCTRL.panTo([e.sourceTarget.feature.geometry.coordinates[1], e.sourceTarget.feature.geometry.coordinates[0]])
        }, 500)

        // create and dispatch the event
        app.utils.dispatchEvent("mipwebsClick", { detail: { contentId: props.objectid } });

    } else if (props[p_tpopobj.chaveurl] !== undefined && props[p_tpopobj.chaveurl] != null) {
        keyv = props[p_tpopobj.chaveurl];
        if (p_tpopobj.url !== undefined && p_tpopobj.url != null) {
            urls = p_tpopobj.url;
            if (urls[keyv] !== undefined && urls[keyv] != null) {
                url = urls[keyv];
            }
        }

        if (url) {
            window.open(url, "_self");
        }
    }
}

function moverfunc(e, p_map, p_tpopobj) {
    var attr, attrlbl, attrval, attrs, attrcontent = '',
        props = e.sourceTarget.feature.properties;

    if (props[p_tpopobj.camponome] !== undefined && props[p_tpopobj.camponome] != null) {
        if (p_tpopobj.popupformat !== undefined && p_tpopobj.popupformat != null) {

            if (p_tpopobj.orderedatribs !== undefined && p_tpopobj.orderedatribs != null && props.jsonattrs !== undefined && props.jsonattrs != null && props.jsonattrs.length > 0) {
                attrs = JSON.parse(props.jsonattrs);
                for (var oi = 0; oi < p_tpopobj.orderedatribs.length; oi++) {
                    attr = p_tpopobj.orderedatribs[oi];
                    attrlbl = p_tpopobj.atriblabels[attr];
                    attrval = attrs[attr];
                    if (attrval == null || attrval == "null" || attrval == "undefined") {
                        attrval = "";
                    }
                    if (attrval != null && String.format("{0}", attrval).length > 0) {
                        attrcontent += String.format(p_tpopobj.attribformat, attrlbl, attrval);
                    }
                }
            }
            content = String.format(p_tpopobj.popupformat, props[p_tpopobj.camponome]) + attrcontent;

        } else {
            content = props[p_tpopobj.camponome];
        }
    }

    L.popup()
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(p_map);

}

function removeLayer(lyrkey) {
    if (INSTANCED_LAYERS[lyrkey] !== undefined) {
        MAPCTRL.removeLayer(INSTANCED_LAYERS[lyrkey]);
        delete INSTANCED_LAYERS[lyrkey];
    }
}

function addLayer(lyrkey, p_default) {

    // p_default - carregamento apenas se layer nao for opcional

    var fetobj, cfgicoobj, ptlfunc, isclustered = false,
        wherecl = '';

    if (LAYERS[lyrkey] === undefined) {
        return;
    }

    tlobj = LAYERS[lyrkey];
    if (tlobj.opcional !== undefined && tlobj.opcional && p_default) {
        return;
    }
    if (tlobj.url === undefined) {
        throw new Error("LAYERS -- layer mal definida, sem URL:" + lyrkey);
    }
    if (INSTANCED_LAYERS[lyrkey] !== undefined) {
        if (console) {
            console.warn("Layer " + lyrkey + " ja esta adicionada ao mapa");
        }
        return;
    }
    if (tlobj.icons !== undefined && tlobj.icons.length > 0) {
        // POINTS

        if (tlobj.cluster !== undefined && tlobj.cluster != null && tlobj.cluster) {
            isclustered = true;
        }
        if (tlobj.where !== undefined && tlobj.where != null) {
            wherecl = tlobj.where;
        }

        if (tlobj.nomecampo === undefined || tlobj.nomecampo == null) {
            if (tlobj.icons.length > 1) {
                if (console) {
                    console.warn("Tema '" + p_lyrkey + "' nÃ£o tem 'nomecampo' definido, para simbolizaÃ§Ã£o temÃ¡tica, mas tem mais do que um icon configurado. Apenas o primeiro serÃ¡ usado");
                }
            }
            cfgicoobj = getIconCfg(0, lyrkey, tlobj.icons[0]);
            if (cfgicoobj) {
                ptlfunc = function (feature, latlng) {
                    return L.marker(latlng, {
                        icon: L.icon(cfgicoobj)
                    });
                }
            } else {
                ptlfunc = null;
            }
        } else {
            var sw, swpairs = [];
            for (var iidx = 0; iidx < tlobj.icons.length; iidx++) {
                if (tlobj.icons[iidx].valorcampo === undefined) {
                    if (console) {
                        console.warn("SimbolizaÃ§Ã£o temÃ¡tica estÃ¡ ativa para o tema '" + p_lyrkey + "' mas o icon n." + (iidx + 1) + " respetivo nÃ£o tem 'valorcampo' definido e, por isso, serÃ¡ ignorado.");
                    }
                    continue;
                }
                cfgicoobj = getIconCfg(iidx, lyrkey, tlobj.icons[iidx]);
                if (cfgicoobj) {
                    swpairs.push([
                        tlobj.icons[iidx].valorcampo,
                        cfgicoobj
                    ]);
                }
            }
            if (swpairs.length == 0) {
                throw new Error("mapinit(): layer '" + lyrkey + "' sem icons, provavel config tematica com campo definido mas sem valores.");
            }

            GlobalSwitchCases[lyrkey] = {}
            for (var i = 0; i < swpairs.length; i++) {
                // o primeiro ICON Ã© o icon por defeito
                if (i == 0) {
                    GlobalSwitchCases[lyrkey]["__DEFAULT__"] = swpairs[i][1];
                }
                GlobalSwitchCases[lyrkey][swpairs[i][0]] = swpairs[i][1];
            }

            ptlfunc = (function (p_lyrkey, p_nomecampo) {
                return function (feature, latlng) {
                    var sc = GlobalSwitchCases[p_lyrkey];
                    var cfgicoobj = sc[feature.properties[p_nomecampo]];
                    if (cfgicoobj == null) {
                        cfgicoobj = sc["__DEFAULT__"];
                    }
                    return L.marker(latlng, {
                        icon: L.icon(cfgicoobj)
                    });
                };
            })(lyrkey, tlobj.nomecampo);
        }


        if (ptlfunc == null) {
            throw new Error("mapinit(): layer '" + lyrkey + "' sem pointToLayer function.");
        }

        fetobj = {
            url: tlobj.url,
            pointToLayer: ptlfunc
        }
    } else {
        if (tlobj.type === undefined && (tlobj.type != 'polys' && tlobj.type != 'poly')) {
            throw new Error("LAYERS -- layer mal definida, sem icons sem tipo poly:" + lyrkey);
        }

        // polys
        if (tlobj.where !== undefined && tlobj.where != null) {
            wherecl = tlobj.where;
        }

        if (tlobj.styleFunc === undefined) {
            throw new Error("mapinit(): layer '" + lyrkey + "' sem 'style' function.");
        }

        fetobj = {
            url: tlobj.url,
            style: tlobj.styleFunc
        }

        if (tlobj.simplifyFactor !== undefined) {
            fetobj.simplifyFactor = tlobj.simplifyFactor;
        }
        if (tlobj.precision !== undefined) {
            fetobj.precision = tlobj.precision;
        }



    }

    if (wherecl) {
        fetobj.where = wherecl;
    }

    var lyr;
    if (isclustered) {
        lyr = L.esri.Cluster.featureLayer(fetobj).addTo(MAPCTRL);
    } else {
        lyr = L.esri.featureLayer(fetobj).addTo(MAPCTRL);
    };

    INSTANCED_LAYERS[lyrkey] = lyr;

    /*
     * Config popup e interacÃ§Ã£o com utilizador
     *
     * */

    var ppcfg = null;
    if (typeof POPUPCFG != 'undefined') {
        ppcfg = POPUPCFG;
    }
    if (ppcfg != null && ppcfg.hasOwnProperty(lyrkey)) {

        tpopobj = ppcfg[lyrkey];

        if (tpopobj.camponome === undefined) {
            throw new Error("POPUPCFG -- layer '" + tblkey + "' mal definida, sem 'camponome'");
        }
        if (tpopobj.chaveurl !== undefined || tpopobj.chaveurl != null) {
            if (tpopobj.url === undefined || tpopobj.url == null) {
                throw new Error("POPUPCFG -- layer '" + tblkey + "' mal definida, tem 'chaveurl' mas nÃ£o tem o dicionÃ¡rio de URLs definido");
            }
        } else {
            if (console) {
                console.warn("Verifica-se que o tema '" + p_lyrkey + "' nÃ£o tem 'chaveurl' definido, nÃ£o terÃ¡ navegaÃ§Ã£o a partir dos objetos geogrÃ¡ficos.");
            }
        }

        (function (p_lyr, p_map, p_tpopobj) {
            p_lyr.on('click', function (e) {
                clickfunc(e, p_tpopobj);
            });
            p_lyr.on('mouseover', function (e) {
                moverfunc(e, MAPCTRL, p_tpopobj);
            });
            p_lyr.on('touch', function (e) {
                clickfunc(e, MAPCTRL, p_tpopobj);
            });
        })(lyr, MAPCTRL, tpopobj);

    }

}

function mapinit() {

    var k, lk, lyrobj, mlyrobj, isesri = false;
    let basemapControl = {};


    MAPCTRL = L.map(MAPAREAID).setView(MAPCENTER, INIT_ZOOMLEVEL);

    var isfirst = true;
    for (var tblkey in TILED_BASEMAP_LAYERS) {

        lyrobj = {};
        if (!TILED_BASEMAP_LAYERS.hasOwnProperty(tblkey)) {
            continue;
        }
        k = TILED_BASEMAP_LAYERS[tblkey];

        if (k.esri !== undefined && k.esri != null && k.esri) {
            isesri = true;
        } else {
            isesri = false;
        }

        if (k.url === undefined) {
            throw new Error("TILED_BASEMAP_LAYERS -- layer mal definida, sem URL:" + tblkey);
        }

        for (var lkey in k) {
            if (!k.hasOwnProperty(lkey)) {
                continue;
            }
            if (!isesri && lkey == 'url') {
                continue;
            }
            lyrobj[lkey] = k[lkey];
        }

        if (k.esri !== undefined && k.esri != null && k.esri) {
            mlyrobj = L.esri.tiledMapLayer(lyrobj);
            if (isfirst) {
                mlyrobj.addTo(MAPCTRL);
            }
        } else {
            mlyrobj = L.tileLayer(k.url, lyrobj);
            if (isfirst) {
                mlyrobj.addTo(MAPCTRL);
            }
        }

        if (!MERGE_BASEMAP_LAYERS) {
            basemapControl[lyrobj.label] = mlyrobj;
            isfirst = false;
        }

    };

    if (!MERGE_BASEMAP_LAYERS) {
        L.control.layers(basemapControl).addTo(MAPCTRL);
    }

    var tlobj, icon, cfgicoobj, ptlfunc, fetobj = {},
        wherecl = null,
        tpopobj;
    for (var lyrkey in LAYERS) {

        if (!LAYERS.hasOwnProperty(lyrkey)) {
            continue;
        }

        addLayer(lyrkey, true);
    };

}
