require("./Assets/css/_custom.scss");
require("./Assets/css/main.css");

let $ = (window as any).$;
/*
let $ = require("jquery");
(window as any).jQuery = (window as any).$ = $;

require("bootstrap");
require("jquery-ui");
require("./Assets/jquery-ui-1.12.1/jquery-ui.css");
require("./Assets/jquery-ui-1.12.1/jquery-ui.theme.css");
require("./Assets/jquery-ui-1.12.1/jquery-ui.structure.css");*/

import * as PIXI from "pixi.js";
import * as d3 from "d3";
import Button from "./Tools/Button";
import LoaderText from "./Tools/LoaderText";
import {isMobile} from "./Tools/DeviceDetect";
import {enableFullscreen} from "./Tools/Fullscreen";

// import * as filters from 'pixi-filters';

class Alliance extends PIXI.Application {
    private Customloader = new PIXI.loaders.Loader();
    private Container = new PIXI.Container();
    private ContainerButtons = new PIXI.Container();
    private filterBackground = new PIXI.filters.ColorMatrixFilter();
    private width: number;
    private height: number;
    private selector;
    private newGraphic = [];
    private _counterGraphic: number = 0;
    private newGraphicObj = [];
    private Circls = [];
    private zoomTrans = {x: 0, y: 0, k: .1};
    private startDrawing: boolean = false;
    private lineTo: boolean = true;
    private backgroundClicked: boolean = false;
    private sprites: object = {};
    // private zoomToBool: boolean = false;
    private view;
    private stage;
    private zoomHandler;
    private Graphics = [];
    private Phases = [];
    private Buttons = [];
    private canvas = null;
    private context = null;
    private widthCanvas = null;
    private heightCanvas = null;
    private D3Interval = null;
    private isMobile: boolean = false;
    private _modeSearh: boolean = false;
    private _graphicHovered: boolean = false;
    private PowredByText = null;
    private MultipleBackground = [];
    private isZooming: boolean = false;
    private options: object = [];

    constructor(width, height, options) {
        super(isMobile() ? window.innerWidth : width, isMobile() ? window.innerHeight : height, options);
    }

    public init(options, callback) {
        this.options = options;
        this.isMobile = isMobile();
        this.Container.zIndex = 0;
        this.Container.anchor = new PIXI.Point(0.5, 0.5);
        this.ContainerButtons.zIndex = 1;
        this.width = this.isMobile ? window.innerWidth : options.width;
        this.height = this.isMobile ? window.innerHeight : options.height;
        this.selector = options.selectorId;

        this.appendView(callback);
        this.setup();
    }

    private appendView(callback) {
        const $this = this;
        document.getElementById($this.selector).appendChild($this.view);
        callback();
    }

    private setup() {
        const $this = this;
        const s = {};
        const text = new LoaderText(($this as any).width, ($this as any).height);

        $this.stage.addChild(text);

        $this.stage.addChild($this.Container);
        ($this.options as any).sprites.forEach((e) => {
            $this.Customloader.add(e.name, e.url);
        });
        // loader.pre(cachingMiddleware);
        // loader.use(parsingMiddleware);
        $this.Customloader.load((loader, resources) => {
            Object.keys(resources).map((e) => {
                this.sprites[e] = new PIXI.Sprite(resources[e].texture);
            });
        });
        ($this as any).Customloader.onProgress.add((e) => {
            let prog = parseInt(e.progress);
            (text as any).text = `Loading ${prog}%`;
        }); // called once per loaded/errored file
        // $this.Customloader.onError.add(() => { }); // called once per errored file
        // $this.Customloader.onLoad.add(() => { }); // called once per loaded file
        $this.Customloader.onComplete.add((e) => {
            $this.stage.removeChild(text);
            /*if (($this.options as any).backgroundMultiple) {
                $this.addBackgroundMultiple();
            } else {

            }*/
            $this.addBackground();
            $this.addGraphics();
            $this.addPhases();
            $this.initZoomAction();
            $this.addSearchButton();
            $this.addButtons();
            $this.addPowredBy();
            $this.resizeCanvas();

        });
    }

    private addBackground() {
        const $this = this;
        if (($this.sprites as any).background.interactive) {
            $this.Container.removeChild(($this.sprites as any).background)
        }
        ($this.sprites as any).background.x = 0;
        ($this.sprites as any).background.y = 0;
        ($this.sprites as any).background.anchor = new PIXI.Point(0.5, 0.5);
        ($this.sprites as any).background.interactive = true;
        ($this.sprites as any).background.filters = [this.filterBackground];
        // const filter = new filters.ColorMatrixFilter();
        //$this.removeColorFromSprite(($this.sprites as any).background);
        ($this.sprites as any).background.on("pointerdown", (e) => {
            const x = e.data.global.x;
            const y = e.data.global.y;
            // console.log(`Point {${x}, ${y}}`);
            if ($this.startDrawing) {
                const xD3 = $this.getD3X(x);
                const yD3 = $this.getD3Y(y);
                $this.newGraphic.push([xD3, yD3, $this.lineTo]);
                $this.Container.removeChild($this.newGraphicObj[$this._counterGraphic]);
                $this.newGraphicObj[$this._counterGraphic] = $this.createGraph($this.newGraphic);
                $this.Container.addChild($this.newGraphicObj[$this._counterGraphic]);
            }

            $this.backgroundClicked = true;
        });
        ($this.sprites as any).background.mouseover = function () {
            ($this.options as any).onMouseOverBackground();
        };
        $this.Container.addChild(($this.sprites as any).background);
    }

    private addBackgroundMultiple() {
        const $this = this;
        $this.MultipleBackground = [
            [($this.sprites as any).background_1, 'background_1'],
            [($this.sprites as any).background_2, 'background_2'],
            [($this.sprites as any).background_3, 'background_3'],
            [($this.sprites as any).background_4, 'background_4'],
            [($this.sprites as any).background_5, 'background_5'],
            [($this.sprites as any).background_6, 'background_6'],
            [($this.sprites as any).background_7, 'background_7'],
            [($this.sprites as any).background_8, 'background_8'],
            [($this.sprites as any).background_9, 'background_9'],
            [($this.sprites as any).background_10, 'background_10'],
            [($this.sprites as any).background_11, 'background_11'],
            [($this.sprites as any).background_12, 'background_12'],
            [($this.sprites as any).background_13, 'background_13'],
            [($this.sprites as any).background_14, 'background_14'],
            [($this.sprites as any).background_15, 'background_15'],
            [($this.sprites as any).background_16, 'background_16'],
            [($this.sprites as any).background_17, 'background_17'],
            [($this.sprites as any).background_18, 'background_18'],
            [($this.sprites as any).background_19, 'background_19'],
            [($this.sprites as any).background_20, 'background_20'],
            [($this.sprites as any).background_21, 'background_21'],
            [($this.sprites as any).background_22, 'background_22'],
            [($this.sprites as any).background_23, 'background_23'],
            [($this.sprites as any).background_24, 'background_24'],
        ];
        $this.MultipleBackground.map((element) => {
            const $this = this;
            let [background, name] = element;
            let found = ($this.options as any).sprites.filter(function (item) {
                return item.name === name;
            });
            background.x = found[0].x;
            background.y = found[0].y;
            background.interactive = true;
            background.filters = [this.filterBackground];
            background.on("pointerdown", (e) => {
                const x = e.data.global.x;
                const y = e.data.global.y;
                // console.log(`Point {${x}, ${y}}`);
                if ($this.startDrawing) {
                    const xD3 = $this.getD3X(x);
                    const yD3 = $this.getD3Y(y);
                    $this.newGraphic.push([xD3, yD3, $this.lineTo]);
                    $this.Container.removeChild($this.newGraphicObj[$this._counterGraphic]);
                    $this.newGraphicObj[$this._counterGraphic] = $this.createGraph($this.newGraphic);
                    $this.Container.addChild($this.newGraphicObj[$this._counterGraphic]);
                }
                $this.backgroundClicked = true;
            });
            background.mouseover = () => {
                ($this.options as any).onMouseOverBackground();
            };
            $this.Container.addChild(background);
        })
    }

    private addPowredBy() {
        const $this = this;
        let style = new PIXI.TextStyle({
            fontFamily: "Arial", // Font Family
            fontSize: 14, // Font Size
            // fontStyle: "italic",// Font Style
            fontWeight: "bold", // Font Weight
            fill: ["#646565"], // gradient
            // stroke: "#ffffff",
            // strokeThickness: 5,
            // dropShadow: true,
            // dropShadowColor: "#000000",
            // dropShadowBlur: 4,
            // dropShadowAngle: Math.PI / 6,
            // dropShadowDistance: 6,
            // wordWrap: true,
            // wordWrapWidth: 440
        });

        $this.PowredByText = new PIXI.Text("Powred by ConceptLab", "arial");
        $this.PowredByText.anchor = new PIXI.Point(0.5, 0.5);
        $this.PowredByText.x = $this.width - 200;
        $this.PowredByText.y = $this.height - 50;
        $this.PowredByText.style = style;
        $this.ContainerButtons.addChild(this.PowredByText);
    }


    private addSearchButton() {

    }

    public search(search) {
        this._modeSearh = search;
        (this.options as any).search(this.Graphics, search);
        if(search){
            this.removeColorFromBackground();
        } else {
            this.addColorToBackground();
        }
    }
    public addGraphicInfo(prp){
        (this.options as any).properties.push(prp)
    }
    public removeGraphicInfoBykey(key){
        if((this.options as any).properties[key] != undefined){
            delete((this.options as any).properties[key])
            this.addItems();
        }
    }
    public addGraphics() {
        const $this = this;
        const Graphics = [];
        $this.removeGraphics();

        ($this.options as any).properties.forEach((G, k) => {
            const keyCords = "keyCoords" in ($this.options as any) ? ($this.options as any).keyCoords : "coords";
            const coords = G[keyCords];
            const Graph = $this.createGraph(coords, G);
            if (Graph) {
                (Graph as any).interactive = true;
                (Graph as any).alpha = G.opacity;
                (Graph as any).buttonMode = true;
                (Graph as any).mouseover = function () {
                    if (!$this.modeSearh && !$this.startDrawing) {
                        (this as any).alpha = 1;
                    }
                    ($this.options as any).onMouseOverPropertie(G);
                    /*let description = "";
                    (G.info.reference) ? description += "<div class=\"row\"><div class=\"col-12\"><p style=\"color:  #fff;font-weight:  bold;\">" + G.info.reference + "</p></div></div>" : "";
                    (!G.info.reference && G.info.title) ? description += "<div class=\"row\"><div class=\"col-12\"><p style=\"color:  #fff;font-weight:  bold;\">" + G.info.title + "</p></div></div>" : "";
                    description += "<div class=\"row\">";
                    let picture = (($this.options as any).hasOwnProperty("pictureNotFoundUrl")) ? ($this.options as any).pictureNotFoundUrl : "";
                    picture = (G.info.image && G.info.image.hasOwnProperty('small')) ? G.info.image.small : picture;
                    (picture) ? description += "<div class=\"col-6 pr-0\"><img class=\"img-fluid\" src='" + picture + "'></div>" : "";
                    description += "<div class=\"col-6\">";

                    (G.info.landUse) ? description += "<p style=\"color:#949b46\"><b style=\"color:#fff;\">" + ($this.options as any).plan_lang.vocation + ": </b> " + G.info.landUse.name + "</p>" : "";
                    (G.info.surface_terrain_show) ? description += "<p style=\"color:#949b46\"><b style=\"color:#fff;\">" + ($this.options as any).plan_lang.surface_du_lot + ": </b> " + G.info.surface_terrain_show + " <span>m²<span></p>" : "";
                    (G.info.surface_habitable_show) ? description += "<p style=\"color:#949b46\"><b style=\"color:#fff;\">" + ($this.options as any).plan_lang.surface_totale + ": </b> " + G.info.surface_habitable_show + " <span>m²<span></p>" : "";
                    if (G.info.pdfDownloadLink) {
                        let [firstPdf] = G.info.pdfDownloadLink;
                        (firstPdf) ? description += "<p style='color: #d1a9a4'>" + ($this.options as any).plan_lang.pdf + "</p>" : "";
                    }
                    description += "</div>";
                    description += "</div>";
                    if (description && !$this.startDrawing) {
                        $("canvas[title]").tooltip("option", "content", description);
                        $('body').removeClass('tooltip-hidden');
                    }*/
                };

                (Graph as any).mouseout = function () {
                    if (!$this.modeSearh && !$this.startDrawing) {
                        (this as any).alpha = G.opacity;
                    }
                };
                Graph.touchstart = function () {
                    Graph.dataTranslate = $this.zoomTrans;
                };
                Graph.pointerdown = function () {
                    Graph.dataTranslate = $this.zoomTrans;
                };
                Graph.click = Graph.tap = function () {
                    //if($this.isMobile) {
                    const k = Graph.dataTranslate.k == $this.zoomTrans.k;
                    let x = Graph.dataTranslate.x - $this.zoomTrans.x;
                    let y = Graph.dataTranslate.y - $this.zoomTrans.y;
                    x = (x > 0) ? x : x * -1;
                    y = (y > 0) ? y : y * -1;
                    const x_diff = x <= 10;
                    const y_diff = y <= 10;
                    if (k && x_diff && y_diff) {
                        ($this.options as any).onClickPropertie(G);
                    }
                    /*} else {
                        $this.showModalProperty(G, $this);
                    }*/
                };
                ($this as any).Container.addChild(Graph);
                Graphics.push({G, Graph});
            }
        });
        $this.Graphics = Graphics;
    }
    public removeGraphics() {
        const $this = this;
        $this.Graphics.map((e) => {
            let {G, Graph} = e;
            $this.Container.removeChild(Graph);
        });

        $this.Graphics = [];
    }

    public addPhases(){
        const $this = this;
        const Phases = [];
        $this.removePhases();
        ($this.options as any).phases.forEach((G, k) => {
            const keyCords = "keyCoords" in ($this.options as any) ? ($this.options as any).keyCoords : "coords";
            const coords = G[keyCords];
            const Graph = $this.createGraph(coords, G);
            if (Graph) {
                (Graph as any).interactive = true;
                (Graph as any).alpha = G.opacity;
                (Graph as any).buttonMode = true;
                (Graph as any).mouseover = function () {
                    if (!$this.modeSearh && !$this.startDrawing) {
                        (this as any).alpha = 1;
                    }
                    ($this.options as any).onMouseOverPhase(G);
                };

                (Graph as any).mouseout = function () {
                    if (!$this.modeSearh && !$this.startDrawing) {
                        (this as any).alpha = G.opacity;
                    }
                };
                Graph.touchstart = function () {
                    Graph.dataTranslate = $this.zoomTrans;
                };
                Graph.pointerdown = function () {
                    Graph.dataTranslate = $this.zoomTrans;
                };
                Graph.click = Graph.tap = function () {
                    //if($this.isMobile) {
                    const k = Graph.dataTranslate.k == $this.zoomTrans.k;
                    let x = Graph.dataTranslate.x - $this.zoomTrans.x;
                    let y = Graph.dataTranslate.y - $this.zoomTrans.y;
                    x = (x > 0) ? x : x * -1;
                    y = (y > 0) ? y : y * -1;
                    const x_diff = x <= 10;
                    const y_diff = y <= 10;
                    if (k && x_diff && y_diff) {
                        $this.showModalProperty(G, $this);
                    }
                    /*} else {
                        $this.showModalProperty(G, $this);
                    }*/
                };
                ($this as any).Container.addChild(Graph);
                Phases.push({G, Graph});
            }
        });
        $this.Phases = Phases;
    }

    public removePhases() {
        const $this = this;
        $this.Phases.map((e) => {
            let {G, Graph} = e;
            $this.Container.removeChild(Graph);
        });

        $this.Phases = [];
    }

    public addItems(){
        this.addGraphics();
        this.addPhases();
    }

    public removeItems(){
        this.removePhases();
        this.removeGraphics();
    }

    private showModalProperty(G, $this) {

    }

    private initZoomAction() {
        const $this = this;
        $this.canvas = d3.select(`#${$this.selector} canvas`);
        $this.context = $this.canvas.node().getContext("2d");
        $this.widthCanvas = $this.canvas.property("width");
        $this.heightCanvas = $this.canvas.property("height");

        $this.zoomHandler = d3.zoom()
            .scaleExtent(($this.options as any).scaleExtent)
            .translateExtent(($this.options as any).translateExtent)
            .on("start", () => {
                return $this.startZoomActions($this);
            })
            .on("zoom", () => {
                return $this.zoomActions($this);
            })
            .on("end", () => {
                return $this.endZoomActions($this);
            })
            .filter(() => {
                return !$this.D3Interval;
            });
        $this.initZommActionFunctionalities();
    }

    private initZommActionFunctionalities() {
        const $this = this;
        let initX = window.innerWidth / 2;
        let initY = window.innerHeight / 2;
        let scalInit = .5;
        if (($this.options as any).hasOwnProperty("initialData")) {
            initX = ($this.options as any).initialData.x;
            initY = ($this.options as any).initialData.y;
            scalInit = ($this.options as any).initialData.k;

        }
        $this.canvas.call($this.zoomHandler).call($this.zoomHandler.transform, d3.zoomIdentity.translate(initX, initY).scale(scalInit));
        $this.canvas.on("click", () => {
            // const x = (d3.event.x - $this.zoomTrans.x) / $this.zoomTrans.k;
            // const y = (d3.event.y - $this.zoomTrans.y) / $this.zoomTrans.k;
        });
    }

    private zoomActions($this) {
        const x = d3.event.transform.x;
        const y = d3.event.transform.y;
        const k = d3.event.transform.k;
        $this.zoomTrans = d3.event.transform;
        // console.dir(d3.event.transform);
        // let translate = "translate(" + d3.event.translate + ")";
        // let scale = "scale(" + d3.event.scale + ")";
        // $this.canvas.attr("transform", translate + scale);
        $this.Container.scale.set(k);
        console.log(x + " --- " + y + " ::: " + k);
        if (x != 0 && y != 0) {
            $this.Container.position.set(x, y);
        }
    }

    private startZoomActions($this) {
        // console.dir("start zoom");
        $this.isZooming = true;
    }

    private endZoomActions($this) {
        // console.dir("end zoom");
        $this.isZooming = false;
    }


    /*private zoomTo(x: number, y: number, k: number, graph) {
     const $this = this;
     const trans = d3.zoomTransform($this.canvas.node());
     const fx = d3.interpolateNumber(364, x);
     const fy = d3.interpolateNumber(0, y);
     const fk = d3.interpolateNumber(trans.k, k);
     let temp = 0;
     $this.D3Interval = d3.interval(function () {
     if (temp < 1) {
     temp += 0.005;
     $this.zoomHandler.scaleBy($this.canvas, fk(temp));
     $this.zoomHandler.translateBy($this.canvas, x, y);
     } else {
     $this.D3Interval.stop();
     $this.D3Interval = null;
     }
     }, 1);
     }*/

    private drawCircle(x, y) {
        const $this = this;
        const c = new PIXI.Graphics();
        c.lineStyle(2, 0xFF00FF);
        c.drawCircle(x, y, 5);
        c.endFill();
        $this.Container.addChild(c);
        $this.Circls.push(c);
    }

    private removeCircls() {
        const $this = this;
        $this.Circls.map((e) => {
            $this.Container.removeChild(e);
        });
    }

    private createGraph(coords, graphInfo = {}) {
        const $this = this;
        if (coords) {
            if (coords.length) {
                let color = 0xc10000;
                let opacity = .5;
                let lineSize = 1;
                if (($this.options as any).hasOwnProperty('defaultColor')) {
                    if (($this.options as any).defaultColor) {
                        color = ($this.options as any).defaultColor;
                    }
                }
                if (($this.options as any).hasOwnProperty('defaultOpacity')) {
                    if (($this.options as any).defaultOpacity) {
                        opacity = ($this.options as any).defaultOpacity;
                    }
                }
                if ((graphInfo as any).hasOwnProperty('info')) {
                    if ((graphInfo as any).info.landUse) {
                        if ((graphInfo as any).info.landUse.color) {
                            color = (graphInfo as any).info.landUse.color;
                            color = (color as any).replace(/#/gi, "0x");
                        }
                    }
                }
                if ((graphInfo as any).hasOwnProperty('color')) {
                    color = (graphInfo as any).color;
                    color = (color as any).replace(/#/gi, "0x");
                }
                if ((graphInfo as any).hasOwnProperty('lineSize')) {
                    lineSize = (graphInfo as any).lineSize;
                }
                const newGraphicObj = new PIXI.Graphics();
                newGraphicObj.beginFill(color, opacity);
                newGraphicObj.lineStyle(lineSize, 0x000000, opacity);
                let firstCoord = [];
                coords.map((e) => {
                    let [x, y, lineTo] = e;
                    if (lineTo == undefined) {
                        lineTo = true;
                    }
                    if (lineTo) {
                        if (!firstCoord.length) {
                            firstCoord = e;
                            newGraphicObj.moveTo(x, y);
                        } else {
                            newGraphicObj.lineTo(x, e[1]);
                        }
                    } else {
                        if (firstCoord) {
                            const [firstX, firstY] = firstCoord;
                            newGraphicObj.lineTo(firstX, firstY);
                            firstCoord = [];
                        }
                        newGraphicObj.moveTo(x, e[1]);
                    }
                });
                newGraphicObj.endFill();
                return newGraphicObj;
            }
        }
        return false;
    }

    private addButtons() {
        const $this = this;
        if ($this.Buttons.length) {
            $this.Buttons.map((e) => {
                $this.ContainerButtons.removeChild(e);
            })
            $this.Buttons = [];
        }
        let width = 150;
        let height = 50;
        let x = 10;
        let y = ($this as any).height - height - 20;
        let txt = "Start drawing";
        if ($this.startDrawing) {
            let txt = "Stop drawing";
        }
        const b = new Button(width, height, x, y, txt, null);
        $this.stage.addChild($this.ContainerButtons);
        //b.buttonMode = true;
        (b as any).on("click", () => {
            $this.startDrawing = !$this.startDrawing;
            if (!$this.startDrawing) {
                (b as any).text.text = "Start drawing";
                if ($this.newGraphic.length) {
                    ($this.options as any).onFinishDrawing($this.newGraphic);
                }
                $this.Container.removeChild($this.newGraphicObj[$this._counterGraphic]);
                $this._counterGraphic++;
                $this.newGraphic = [];

            } else {
                (b as any).text.text = "Stop drawing";
            }
        });
        $this.Buttons.push(b);
        width = 250;
        height = 50;
        x = 170;
        y = ($this as any).height - height - 20;
        const returnLastActionB = new Button(width, height, x, y, "Return to last action", null);
        //returnLastActionB.buttonMode = true;
        (returnLastActionB as any).on("click", () => {
            if ($this.newGraphic.length) {
                $this.newGraphic.splice(-1, 1);
                $this.Container.removeChild($this.newGraphicObj[$this._counterGraphic]);
                $this.newGraphicObj[$this._counterGraphic] = $this.createGraph($this.newGraphic);
                if ($this.newGraphicObj[$this._counterGraphic]) {
                    $this.Container.addChild($this.newGraphicObj[$this._counterGraphic]);
                }
            }
        });
        $this.Buttons.push(returnLastActionB);


        width = 150;
        height = 50;
        x = 450;
        y = ($this as any).height - height - 20;
        txt = "Move to";
        if ($this.lineTo) {
            txt = "Line to";
        }
        const actionButton = new Button(width, height, x, y, txt, null);
        (actionButton as any).on("click", () => {
            $this.lineTo = !$this.lineTo;
            console.log($this.lineTo);
            if (!$this.lineTo) {
                (actionButton as any).text.text = "Move to";
            } else {
                (actionButton as any).text.text = "Line to";
            }
        });
        $this.Buttons.push(actionButton);

        if (($this.options as any).hasOwnProperty('showButtonPlans')) {
            if (($this.options as any).showButtonPlans) {
                $this.ContainerButtons.addChild(actionButton);
                $this.ContainerButtons.addChild(returnLastActionB);
                $this.ContainerButtons.addChild(b);
            }
        }
    }

    public getD3X(x: number) {
        const $this = this;
        return (x - $this.zoomTrans.x) / $this.zoomTrans.k;
    }

    public getD3Y(y: number) {
        const $this = this;
        return (y - $this.zoomTrans.y) / $this.zoomTrans.k;
    }

    public resizeCanvas() {
        const $this = this;
        $this.rendererResize($this);
        window.addEventListener('resize', () => {
            return $this.rendererResize($this);
        });
        window.addEventListener('deviceOrientation', () => {
            return $this.rendererResize($this);
        });
    };

    public rendererResize($this) {
        if (isMobile() || ($this.options as any).fullSizeShow) {
            $this.width = window.innerWidth;
            $this.height = window.innerHeight;
        }
        let ratio = Math.min(window.innerWidth / $this.width,
            window.innerHeight / $this.height);
        if (ratio > 1) {
            ratio = 1;
        }
        $this.Container.scale.x =
            $this.Container.scale.y =
                $this.ContainerButtons.scale.x =
                    $this.ContainerButtons.scale.y = ratio;
        $this.addButtons();
        $this.PowredByText.x = $this.width - 200;
        $this.PowredByText.y = $this.height - 50;
        // Update the renderer dimensions
        let width = Math.ceil($this.width * ratio);
        let height = Math.ceil($this.height * ratio);
        /*if(window.innerWidth > window.innerHeight && isMobile()){
            [width, height] = [height, width];
        }*/
        //$this.resize(width, height);
        $this.canvas.call($this.zoomHandler).call($this.zoomHandler.transform, d3.zoomIdentity.translate($this.zoomTrans.x, $this.zoomTrans.y).scale($this.zoomTrans.k));

    };

    public removeColorFromBackground() {
        const $this = this;
        if (($this.options as any).backgroundMultiple) {
            $this.MultipleBackground.map((element) => {
                let [background] = element;
                $this.removeColorFromSprite(background);
            })
        } else {
            $this.removeColorFromSprite(($this.sprites as any).background);
        }
    }

    public addColorToBackground() {
        console.log("addColorToBackground")
        const $this = this;
        if (($this.options as any).backgroundMultiple) {
            $this.MultipleBackground.map((element) => {
                let [background] = element;
                $this.removeFiltersFromSprite(background);
            })
        } else {
            $this.removeFiltersFromSprite(($this.sprites as any).background);
        }

    }

    private removeColorFromSprite(sprite) {
        this.filterBackground.desaturate();
    }

    private removeFiltersFromSprite(sprite) {
        this.filterBackground.reset();
    }

    get modeSearh(): boolean {
        return this._modeSearh;
    }

    set modeSearh(value: boolean) {
        this._modeSearh = value;
    }
}

export {
    Alliance
}
