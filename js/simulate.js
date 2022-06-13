var bluewhitered = "vec3 colormap(vec3 direction) {     if (direction.z < 0.0) {         vec3 color_down = vec3(0.0, 0., 1.0);         vec3 color_up = vec3(1.0, 1.0, 1.0);         return mix(color_down, color_up, normalize(direction).z+1.0);     } else {         vec3 color_down = vec3(1.0, 1.0, 1.0);         vec3 color_up = vec3(1.0, 0.0, 0.0);         return mix(color_down, color_up, normalize(direction).z);     } }";
let webglspins, iteration = 0, k, minLengthPos;
    n = 0,
    simulateObject = {
        insertedFile: "",
        spinPositions: [],
        spinDirections: [],
        spinPositionsWeb: [],
        spinDirectionsWeb: [],
        spinNeighbor: [],
        simulateNew: (t,k) => {
            n = t, simulateObject.spinPositions = [], simulateObject.spinDirections = [], webglspins = simulateObject.createwebglspins(), iteration += 1;
            for (var e = 0; e < Math.sqrt(n); e++)
                for (var i = 0; i < Math.sqrt(n); i++) {
                    var s = [i * 5, e*5, 0];
                    Array.prototype.push.apply(simulateObject.spinPositions, s);
                    var a = [Math.sin(.3 * i) * Math.cos(.05 * (e + iteration)), Math.cos(.3 * i) * Math.cos(.05 * (e + iteration)), Math.sin(.05 * (e + iteration))];
                    Array.prototype.push.apply(simulateObject.spinDirections, a)
                }
            simulateObject.createDataForWebGL(k), 
            simulateObject.neighbors(), 
            simulateObject.updateCameraLocation(),
            simulateObject.magnetization(),
            simulateObject.energy();
        },
        sortPosDirWeb(){
            var pos = _.chunk(simulateObject.spinPositions, 3);
            var dir = _.chunk(simulateObject.spinDirections, 3)
            var tmp;
            for (var i = 0; i < pos.length; i++){
                for (var j = i; j < pos.length; j++){
                    if (pos[i][1] > pos[j][1]) { 
                        tmp = pos[j]; 
                        pos[j] = pos[i]; 
                        pos[i] = tmp;
                        tmp = dir[j];
                        dir[j] = dir[i];
                        dir[i] = tmp;
                    }
                }
            }
            for (var i = 0; i < pos.length; i++){
                for (var j = i; j < pos.length; j++){
                    if (pos[i][0] > pos[j][0] && pos[i][1] == pos[j][1]) { 
                        tmp = pos[j]; 
                        pos[j] = pos[i]; 
                        pos[i] = tmp;
                        tmp = dir[j];
                        dir[j] = dir[i];
                        dir[i] = tmp;
                    }
                }
            }
            console.log(pos);
            console.log(dir);
            simulateObject.spinPositions = _.concat(...pos);
            simulateObject.spinDirections = _.concat(...dir);
        },
        //Генерация массива данных, для отображения спинов через WebGL
        createDataForWebGL: (k) => {
            simulateObject.spinDirectionsWeb = [];
            simulateObject.spinPositionsWeb = [];
            var oldPos = simulateObject.spinPositions;
            var oldDir = simulateObject.spinDirections;
            simulateObject.findMinLengthPos();
            var minPos = simulateObject.minLengthPos;
            var minLength = simulateObject.findMinLengthSpin();
            var tempPos = [];
            var tempDir = [];
            for (var i = 0; i < oldDir.length; i+=3){
                tempPos[0] = oldPos[i] / minPos;
                tempPos[1] = oldPos[i+1] / minPos;
                tempPos[2] = oldPos[i+2];
                tempDir[0] = oldDir[i]/minLength * simulateObject.k;
                tempDir[1] = oldDir[i+1]/minLength * simulateObject.k;
                tempDir[2] = oldDir[i+2]/minLength * simulateObject.k;
                Array.prototype.push.apply(simulateObject.spinDirectionsWeb, tempDir);
                Array.prototype.push.apply(simulateObject.spinPositionsWeb, tempPos);
            }
            simulateObject.sortPosDirWeb();
            webglspins.updateSpins(simulateObject.spinPositionsWeb, simulateObject.spinDirectionsWeb)
        },
        //Возвращает длину вектора
        vectLength: (vect) => {
            var tmp = 0;
            var value = 0;
            for (var i = 0; i < 6; i+=2){
                    value = Math.abs(vect[i] - vect[i+1]);
                    tmp += value * value;
            }
            return Math.sqrt(tmp);
        },
        //Поиск минимального расстояния между позициями спинов
        findMinLengthPos: () => {
            var tempPos = simulateObject.spinPositions;
            simulateObject.minLengthPos = simulateObject.vectLength([tempPos[0],tempPos[3],tempPos[1], tempPos[4], tempPos[2], tempPos[5]]);
            var length;
            for (var i = 3; i < tempPos.length - 3; i+=3)
                for (var j = i+3; j < tempPos.length - 3; j+=3){
                    length = simulateObject.vectLength([tempPos[i], tempPos[j], tempPos[i+1], tempPos[j+1], tempPos[i+2], tempPos[j+2]]);
                    if (simulateObject.minLengthPos > length){
                        simulateObject.minLengthPos = length;
                    }
                }
            document.getElementById("r_spin").value = simulateObject.minLengthPos;
        },
        //Поиск минимальной длины вектора
        findMinLengthSpin: () => {
            var pos = simulateObject.spinPositions;
            var dir = simulateObject.spinDirections;
            var length = [];
            for (var i = 0; i < dir.length; i+=3){
                length.push(Math.sqrt(Math.abs(((dir[i]-pos[i]) * (dir[i]-pos[i])) + ((dir[i+1]-pos[i+1]) * (dir[i+1]-pos[i+1])) + dir[i+2])));
            }
            var min = length[0];
            for (var i = 0; i < dir.length/3; i++){
                if (length[i] < min) {min = length[i];}
            }
            return min;
        },
        simulateByData: () => {
            n = simulateObject.spinPositions.length / 3, webglspins = simulateObject.createwebglspins(), simulateObject.createDataForWebGL(k), simulateObject.neighbors(), simulateObject.updateCameraLocation(), simulateObject.magnetization(), simulateObject.energy();
        },
        downloadFile: () => {
            const t = parseToFile(simulateObject.spinPositions, simulateObject.spinDirections);
            var e = new Blob(t, {
                type: "text/plain"
            });
            saveAs(e, "spins.mfsys")
        },
        createwebglspins: () => {
            if (flagCreator == 0) {
                return new WebGLSpins(document.getElementById('webgl-canvas'), {
                    upVector: [0, 1, 0],
                    levelOfDetail: 10,
                    backgroundColor: [0.1, 0.11, 0.13],
                    colormapImplementation: bluewhitered,
                    renderers: [
                        WebGLSpins.renderers.ARROWS, [WebGLSpins.renderers.SPHERE, [0.0, 0.0, 0.2, 0.2]],
                        [WebGLSpins.renderers.COORDINATESYSTEM, [0.0, 0.2, 0.2, 0.2]]
                    ]
                })
                flagCreator++;
            } else {
                webglspins.updateOptions();
                return webglspins;
            };
        },
        //Поиск максимальной значения координат X,Y
        findMaxXY: () => {
            var tempXY = simulateObject.spinPositionsWeb;
            var maxXY = [tempXY[0],tempXY[1]];
            for (var i = 0,  b = 1; i,b < tempXY.length; i+=3, b+=3){
                if (maxXY[0] < tempXY[i]){ maxXY[0] = tempXY[i] }
                if (maxXY[1] < tempXY[b]){ maxXY[1] = tempXY[b] }
            }
            return maxXY;
        },
        //Поиск минимального значения координат X,Y
        findMixXY: () => {
            var tempXY = simulateObject.spinPositionsWeb;
            var minXY = [tempXY[0],tempXY[1]];
            var s = 1;
            for (var i = 0,  b = 1; i,b < tempXY.length; i+=3, b+=3){
                if (minXY[0] > tempXY[i]){ minXY[0] = tempXY[i] }
                if (minXY[1] > tempXY[b]){ minXY[1] = tempXY[b] }
            }
            return minXY;
        },
        //Обновить положение камеры (установить на середину решетки)
        updateCameraLocation: () => {
            var maxXY = simulateObject.findMaxXY();
            var minXY = simulateObject.findMixXY();
            var l = (maxXY[0] + minXY[0]) / 2;
            var c = (maxXY[1] + minXY[1]) / 2;
            webglspins.updateOptions({
                cameraLocation: [l, c, Math.sqrt(n)*2],
                centerLocation: [ l,  c , 0],
            });
        },
        neighbors: () => {
            var n = simulateObject.spinPositions;
            var r_vector = document.getElementById("r_spin").value;
            if (r_vector == "0"){
                r_vector = simulateObject.minLengthPos;
            }
            var tmp = [];
            var counter;
            for (var t = 0; t < n.length/3; t++){
                counter = 0;
                tmp[t] = [];
                for (var e = 0; e < n.length/3; e++) {
                    if(n[t*3] == n[e*3] && n[t*3+1] == n[e*3+1]) continue;
                    if (n[t*3] + r_vector >= n[e*3] && n[t*3] - r_vector <= n[e*3] && n[t*3+1] + r_vector >= n[e*3+1] && n[t*3+1] - r_vector <= n[e*3+1])
                    {tmp[t].push([n[e*3],n[e*3+1],n[e*3+2]]);}
                }
            }
            simulateObject.spinNeighbor = tmp;
        },
        magnetization() {
            var M_x = 0.;
            var M_y = 0.;
            var M_z = 0.;
            var M = 0.;
            var n = simulateObject.spinDirections.length/3;
    
            for (var num = 0; num < n * 3; num += 3) {
                 M_x += simulateObject.spinDirections[num]; // x
                M_y += simulateObject.spinDirections[num + 1]; // y
                M_z += simulateObject.spinDirections[num + 2]; // z
            }
            M = Math.sqrt(M_x * M_x + M_y * M_y + M_z * M_z) / (n);
            document.getElementById('display-magnetization').value = "M: " + Math.abs(M).toExponential(5);
        },
        ferromagnetic_create() {
            simulateObject.spinPositions = [], simulateObject.spinDirections = [];
            for (var t = 0; t < Math.sqrt(n); t++)
                for (var e = 0; e < Math.sqrt(n); e++) {
                    var i = [2 * e, 2 * t, 0];
                    Array.prototype.push.apply(simulateObject.spinPositions, i);
                    Array.prototype.push.apply(simulateObject.spinDirections, [0, 0, 1])
                }
            simulateObject.createDataForWebGL(k);
            simulateObject.neighbors()
            this.energy();
            this.magnetization();
        },
        vector_mult(vect1, vect2){
            var vect_m = 0;
            for (var i = 0 ; i < 3; i++){
                if(!vect1[i] || !vect2[i]) continue;
                vect_m += vect1[i]*vect2[i];
            }
            return vect_m;
        },
        dipol_dipol (){
            var energy = 0;
            var mi, mj, r, r_vect, d = document.getElementById("dipol_radius").value, ri, rj;
            for (var i = 0; i < simulateObject.spinDirections.length/3; i++){
                ri = [simulateObject.spinPositions[i*3], simulateObject.spinPositions[i*3+1], simulateObject.spinPositions[i*3+2]]
                mi = [simulateObject.spinDirections[i*3], simulateObject.spinDirections[i*3+1], simulateObject.spinDirections[i*3+2]];
                for (var j = i; j < simulateObject.spinDirections.length/3; j++){
                    if (i==j) continue;
                    rj = [simulateObject.spinPositions[j*3], simulateObject.spinPositions[j*3+1], simulateObject.spinPositions[j*3+2]]
                    mj = [simulateObject.spinDirections[j*3], simulateObject.spinDirections[j*3+1], simulateObject.spinDirections[j*3+2]];
                    r = simulateObject.vectLength([rj[0], ri[0], rj[1], ri[1], rj[2], ri[2]]);
                    r_vect = [rj[0] - ri[0], rj[1] - ri[1], rj[2]- ri[2]];
                    energy += d * ( simulateObject.vector_mult(mi,mj)/Math.pow(r, 3) - 3 * ( (simulateObject.vector_mult(mi,r_vect) * simulateObject.vector_mult(mj,r_vect)) / Math.pow(r,5) ));
                }
            }
            return energy;
        },
        external_field(){
            var energy = 0, x = document.getElementById("ext_direction_x").value, y = document.getElementById("ext_direction_y").value,
                            z = document.getElementById("ext_direction_z").value,
                            h_vect = [x,y,z], h = document.getElementById("external_magnitude_value").value;
            for (var i = 0; i < simulateObject.spinDirections.length/3; i++){
                energy += simulateObject.vector_mult([simulateObject.spinDirections[i*3], simulateObject.spinDirections[i*3+1], simulateObject.spinDirections[i*3+2]],h_vect);
            }
            return h*energy;
        },
        exchange(){
            var mi, mj, energy = 0, d = document.getElementById("exchange_value").value;
            for (var i = 0; i < simulateObject.spinDirections.length/3; i++){
                mi = [simulateObject.spinDirections[i*3],simulateObject.spinDirections[i*3+1],simulateObject.spinDirections[i*3+2]];
                for (var j = 0; j < simulateObject.spinNeighbor[i].length; j++){
                    mj = simulateObject.spinNeighbor[i][j];
                    energy += simulateObject.vector_mult(mi,mj);
                }
            }
            return d*energy;
        },
        anisotropy(){
            var A = document.getElementById('anisotropy_value').value,
                a_x = document.getElementById('ansp_direction_x').value,
                a_y = document.getElementById('ansp_direction_y').value,
                a_z = document.getElementById('ansp_direction_z').value,
                a = [a_x, a_y, a_z], mi, energy = 0, value;
            for (var i = 0; i < simulateObject.spinDirections.length/3; i++){
                mi = [simulateObject.spinDirections[i*3], simulateObject.spinDirections[i*3 + 1], simulateObject.spinDirections[i*3 + 2]];
                value = simulateObject.vector_mult(mi, a);
                energy += value * value;
            }
            return A*energy;
        },
        energy() {
            var energy = 0;
            if (!document.getElementById('dipol_radius').disabled){
                energy += simulateObject.dipol_dipol();
            }
            if (!document.getElementById('anisotropy_value').disabled){
                energy += simulateObject.anisotropy();
            }
            if (!document.getElementById('external_magnitude_value').disabled){
                energy += simulateObject.external_field();
            }
            if (!document.getElementById('exchange_value').disabled){
                energy += simulateObject.exchange();
            }
            document.getElementById('display-energy').value = "E: " + energy.toExponential(5);
        },
        getRandomInclusive: (t, e) => (t = Math.ceil(t), e = Math.floor(e), Math.floor(Math.random() * (e - t + 1)) + t),
        getRandomIzing: () => 0 === Math.floor(2 * Math.random()) ? -1 : 1,
        randomspinIzing_create() {
            iteration += 1, simulateObject.spinPositions = [], simulateObject.spinDirections = [];
            for (var t = 0; t < Math.sqrt(n); t++)
                for (var e = 0; e < Math.sqrt(n); e++) {
                    var i = simulateObject.getRandomIzing(),
                        s = [2 * e, 2 * t, 0];
                    Array.prototype.push.apply(simulateObject.spinPositions, s);
                    var a = [0, 0, i];
                    Array.prototype.push.apply(simulateObject.spinDirections, a)
                }
            simulateObject.createDataForWebGL(k);
            this.energy();
            this.magnetization();
        },
        randomspin_create() {
            Math.sqrt(n);
            simulateObject.spinPositions = [], simulateObject.spinDirections = [];
            for (var t = 0; t < Math.sqrt(n); t++)
                for (var e = 0; e < Math.sqrt(n); e++) {
                    var i = [2 * e, 2 * t, 0];
                    Array.prototype.push.apply(simulateObject.spinPositions, i);
                    var s = simulateObject.getRandomInclusive(0, 360),
                        a = simulateObject.getRandomInclusive(0, 180),
                        r = s * Math.PI / 180,
                        o = a * Math.PI / 180,
                        c = [Math.sin(o) * Math.cos(r), Math.sin(o) * Math.sin(r), Math.cos(o)];
                    Array.prototype.push.apply(simulateObject.spinDirections, c)
                }
            simulateObject.createDataForWebGL(k);
            this.energy();
            this.magnetization();
        },
        skyrmion_create(){
            var t = .125 * Math.sqrt(n);
            simulateObject.spinPositions = [], simulateObject.spinDirections = [];
            for (var e = 0; e < Math.sqrt(n); e++)
                for (var i = 0; i < Math.sqrt(n); i++) {
                    var s = [2 * i, 2 * e, 0];
                    Array.prototype.push.apply(simulateObject.spinPositions, s);
                    var a = i - Math.sqrt(n) / 2,
                        r = e - Math.sqrt(n) / 2,
                        o = a * a + r * r + t * t,
                        c = [-t * a / o, -t * r / o, (a * a + r * r - t * t) / o];
                    Array.prototype.push.apply(simulateObject.spinDirections, c)
                }
            simulateObject.createDataForWebGL(k)
            this.energy();
            this.magnetization();
        },
        setCoef: coef => {
            simulateObject.k = coef;
        },
        createDataFor2DVisual(){
            var arrIndx = [];
            var colums = 1;
            var pos = simulateObject.spinPositions;
            var y = pos[1];
            for (var i = 4 ; i < pos.length; i+=3){
                if (y != pos[i]){
                    colums++;
                    y = pos[i];
                }
            }
            arrIndx[0] = [];
            var tmpY = pos[1], counter = 0;
            
            for (var i = 1; tmpY == pos[i]; i+=3){
                arrIndx[0].push((i - 1)/3);
                counter++;
            }

            for (var i = 1; i < colums; i++){
                tmpY = pos[counter*3+1];
                arrIndx[i] = [];
                for (var j = counter; tmpY == pos[counter*3+1]; j++){
                    arrIndx[i].push(counter);
                    counter++;
                }
            }
            var arrTriangle = [];
            var n;
            for (var i = 0; i < colums-1; i++){
                n = arrIndx[i].length;
                for (var j = 0; j < n; j++){
                    if(n <= 2){
                        arrTriangle.push(arrIndx[i][j], arrIndx[i+1][j],arrIndx[i+1][j+1]);
                        if (j == 2) arrTriangle.push(arrIndx[i][j], arrIndx[i][j-1],arrIndx[i+1][j]);
                    }
                    else {
                        if (j==0){
                            arrTriangle.push(arrIndx[i][j], arrIndx[i+1][j],arrIndx[i+1][j+1]);
                        }
                        else if (j == n-1){
                            arrTriangle.push(arrIndx[i][j], arrIndx[i][j-1],arrIndx[i+1][j]);
                        }
                        else {
                            arrTriangle.push(arrIndx[i][j], arrIndx[i][j-1],arrIndx[i+1][j]);
                            arrTriangle.push(arrIndx[i][j], arrIndx[i+1][j],arrIndx[i+1][j+1]);
                        }
                    }

                }
            }
            return arrTriangle;
            
        }
    };

    function parseToFile(spinPositions, spinDirections) {
        const spinsStrings = [];
        spinsStrings.push('[header]\n');
        spinsStrings.push('version=3\n');
        if($("option:selected", $('#select-rendermode'))[0].value == 'ARROWS'){
            spinsStrings.push('dimensions=3\n');
        }
        else spinsStrings.push('dimensions=2\n');
        spinsStrings.push('type=standart\n');
        spinsStrings.push('size=' + spinPositions.length + '\n');
        spinsStrings.push('[parts]\n');
        for (let index = 0; index < spinPositions.length; index += 3) {
            let spinPosition = spinPositions.slice(index, index + 3);
            let spinDirection = spinDirections.slice(index, index + 3);
    
            let pos = spinPosition.map(el => `${el} \t`);
            let dir = spinDirection.map(el => `${el} \t`);
            let result = "";
            result += (index/3 + `\t`);
            pos.forEach(p => result += p);
            dir.forEach(p => result += p);
            if (index != spinPositions.length - 3)
                result += "\n";
            spinsStrings.push(result);
        }
        return spinsStrings;
    }

    function parseToArrays(t, e) {
        const i = t.split("\n");
        e.spinPositions = [], e.spinDirections = [];
        for (let t = i.indexOf("[parts]") + 1; t < i.length; t ++) {
            let s = i[t].split(/\t|  /), //делит по табуляции или двум пробелам
                n = s.slice(1, 4),
                a = s.slice(4, 7);
            for (let t = 0; t < 3; t++) {
                if(n[t] == -0) n[t] = 0;
                if(a[t] == -0) a[t] = 0;
                const i = parseFloat(n[t]),
                    s = parseFloat(a[t]);
                e.spinPositions.push(i), e.spinDirections.push(s)
            }
        }
    }

//Смена цвета
function updateColormap() {
    var colormap = $("option:selected", $('#select-colormap'))[0].value;
    webglspins.updateOptions({
    colormapImplementation: WebGLSpins.colormapImplementations[colormap]
    });
}

function checkSquareGrid() {
    var lengthGrid = simulateObject.spinPositions.length/3;
    var sqrtLength = Math.floor(Math.sqrt(lengthGrid));
    return (sqrtLength*sqrtLength == lengthGrid);
}

//Смена режима отображения
function updateRenderMode() {
    const initN = document.getElementById('initN');
    var surfaceIndices;
    if (checkSquareGrid()){
    surfaceIndices = WebGLSpins.generateCartesianSurfaceIndices(initN.value, initN.value);}
    else surfaceIndices = simulateObject.createDataFor2DVisual();
    webglspins.updateOptions({surfaceIndices: surfaceIndices});
    var renderMode = $("option:selected", $('#select-rendermode'))[0].value;
    var renderers = [WebGLSpins.renderers[renderMode]];
    var showCoordinateSystemWidget = true;
    if (showCoordinateSystemWidget) {
      renderers.push([WebGLSpins.renderers.COORDINATESYSTEM, [0, 0, 0.2, 0.2]]);
    }
    var showSphereWidget = true;
    if (showSphereWidget) {
      renderers.push([WebGLSpins.renderers.SPHERE, [0, 0, 0.2, 0.2]]);
    }
    webglspins.updateOptions({
      renderers: renderers
    });
  }

// Меню - бургер
function toggleMenu(){
    const button = document.getElementById('btn-menu');
    const menu = document.getElementById('list-menu');
    button.classList.toggle('active');
    menu.classList.toggle('active');
}

var flagRuler = 0;             //флаг для линейки
var flagSwapSpin = 0;           //флаг для поворота спина
var arrayForDistance = [];      //массив координат для линейки

//Обработчик события для линейки
function getDistance(){
    const button = document.getElementById('btn-ruler');
    button.classList.toggle('active');
    if(flagRuler == 2){
        document.getElementById('display-distance').value = simulateObject.vectLength([arrayForDistance[0],arrayForDistance[2]
            ,arrayForDistance[1],arrayForDistance[3],0 ,0]).toExponential(5);
        arrayForDistance = [];
        return;
    }
    document.getElementById('display-distance').value = "Точки не выбраны";
    flagRuler = 1;
}

//Обработчик события поворота спина
function swapSpin(){
    const button = document.getElementById('btn-swap');
    button.classList.toggle('active');
    if (flagSwapSpin == 0){
    flagSwapSpin = 1;
    }
    else if (flagSwapSpin == 1){
        flagSwapSpin = 0;
    }
}

//Рулетка, поворот спина, отображение координат
function getSelectInd(ind){
    temp2 = simulateObject.spinDirections;
    temp = simulateObject.spinDirectionsWeb;
    var dirPos = simulateObject.spinPositions;
    if (flagRuler == 1){
        arrayForDistance.push(dirPos[ind*3], dirPos[ind*3+1]);
        flagRuler ++;
    }
    else if (flagRuler == 2){
        arrayForDistance.push(dirPos[ind*3], dirPos[ind*3+1]);
        getDistance();
        flagRuler = 0;
    }
    if (flagSwapSpin){
        temp [ind*3] *= -1;
        temp [ind*3+1] *= -1;
        temp [ind*3+2] *= -1;
        temp2 [ind*3] *= -1;
        temp2 [ind*3+1] *= -1;
        temp2 [ind*3+2] *= -1;
        simulateObject.spinDirections = temp2;
        webglspins.updateSpins(simulateObject.spinPositionsWeb, temp);
        simulateObject.energy();
        simulateObject.magnetization();
    }
    document.getElementById('display-xy').value = "X: " + (dirPos[ind*3]).toFixed(3) + " Y: " + (dirPos[ind*3+1]).toFixed(3);
}

function exchange_check() {
    var temp = document.getElementById('exchange_value');
    if (temp.disabled)temp.disabled = 0;
    else temp.disabled = 1;
    simulateObject.energy();
};

function external_check() {
    var temp = document.getElementById('external_magnitude_value');
    if (temp.disabled){
        temp.disabled = 0;
        document.getElementById('ext_direction_x').disabled = 0;
        document.getElementById('ext_direction_y').disabled = 0;
        document.getElementById('ext_direction_z').disabled = 0;
    }
    else {
        temp.disabled = 1;
        document.getElementById('ext_direction_x').disabled = 1;
        document.getElementById('ext_direction_y').disabled = 1;
        document.getElementById('ext_direction_z').disabled = 1;
    }
    simulateObject.energy();
};

function dmi_check() {
    var temp = document.getElementById('dmi_value');
    if (temp.disabled)temp.disabled = 0;
    else temp.disabled = 1;
    simulateObject.energy();
};

function anisotropy_check() {
    var temp = document.getElementById('anisotropy_value');
    if (temp.disabled){
        temp.disabled = 0;
        document.getElementById('ansp_direction_x').disabled = 0;
        document.getElementById('ansp_direction_y').disabled = 0;
        document.getElementById('ansp_direction_z').disabled = 0;
    }
    else {
        temp.disabled = 1;
        document.getElementById('ansp_direction_x').disabled = 1;
        document.getElementById('ansp_direction_y').disabled = 1;
        document.getElementById('ansp_direction_z').disabled = 1;
    }
    simulateObject.energy();
};

function dipol_check() {
    var temp = document.getElementById('dipol_radius');
    if (temp.disabled)temp.disabled = 0;
    else temp.disabled = 1;
    simulateObject.energy();
};
 
function getImage(canvas){
    var imageData = canvas.toDataURL();
    var image = new Image();
    image.src = imageData;
    return image;
}
 
function saveImage(image) {
    var link = document.createElement("a");
 
    link.setAttribute("href", image.src);
    link.setAttribute("download", "canvasImage");
    link.click();
}
