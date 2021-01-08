let theme = {
    bg:   {r: 137/255, g: 171/255, b: 227/255},
    col1: {r: 252/255, g: 246/255, b: 245/255},
    col2: {r: 255/255, g: 150/255, b: 150/255}   
};

export default class Theme {
    
    static use(thm) { theme = thm; }
    static get bg()   { return theme.bg;   }
    static get col1() { return theme.col1; }
    static get col2() { return theme.col2; }

}