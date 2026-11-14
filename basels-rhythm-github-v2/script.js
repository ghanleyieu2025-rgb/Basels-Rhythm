(function(){
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var journey=$('#journey'),svg=$('#river'),probe=$('#probe'),root=document.documentElement,
      grad=$('#riverGrad'),clipRect=$('#clipRect'),boat=$('#boat'),heroPh=$('#heroPhoto');
  var riverPaths=[$('#riverBase'),$('#riverHalo'),$('#riverFlow'),$('#riverDash')];
  var heroPaths=[$('#heroLine'),$('#heroCore'),$('#heroDash')];
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var narrowMQ=window.matchMedia('(max-width: 759px)');
  var brandEl=document.querySelector('.brand');
  var SEASONS=['s-dawn','s-night','s-summer','s-art','s-autumn','s-xmas'];
  var G={ok:false,season:null,id:null,stops:[]};

  function rel(el,ref){return el.getBoundingClientRect().top-ref.getBoundingClientRect().top}
  function anchorY(el){return rel(el,journey)+Math.min(el.offsetHeight/2,38)}
  function riverX(y){
    var t=y-G.y0;
    return G.cx+G.A*Math.sin(t/G.P*6.2832)+G.A*0.3*Math.sin(t/(G.P*0.41)*6.2832+1.3);
  }

  // the river starts in the water of the opening photo and flows out of its bottom edge into the page
  function heroD(narrow){
    var r=document.getElementById('start').getBoundingClientRect(),j=journey.getBoundingClientRect();
    var L=r.left-j.left,T=r.top-j.top,w=r.width,h=heroPh.offsetHeight;
    var ex=riverX(G.y0),ey=G.y0,slope=riverX(ey+1)-ex;
    var sx=L+(narrow?0.60:0.80)*w,sy=T+(narrow?0.86:0.84)*h;
    G.hs={x:sx,y:sy};
    var k=Math.max(50,(ey-(T+h))*1.2+30);
    return 'M'+sx.toFixed(1)+' '+sy.toFixed(1)+
      ' C'+sx.toFixed(1)+' '+(T+h*0.94).toFixed(1)+' '+(ex-slope*k).toFixed(1)+' '+(ey-k).toFixed(1)+' '+ex.toFixed(1)+' '+ey.toFixed(1);
  }

  function layout(){
    var W=journey.clientWidth,H=journey.offsetHeight,narrow=narrowMQ.matches;
    var safe=probe.offsetWidth||0;
    G.cx=narrow?Math.max(16,safe)+18:W/2;
    G.A=narrow?8:34;
    G.P=narrow?340:560;
    G.top=journey.getBoundingClientRect().top+window.scrollY;
    G.y0=anchorY($('#source'));
    G.y1=rel($('#sink'),journey)+30;
    var ayEl=$('#allyear');if(ayEl&&!ayEl.hidden){G.y1=anchorY(ayEl.querySelector('.mark'))}
    svg.classList.toggle('narrow',narrow);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);

    var d='M'+riverX(G.y0).toFixed(1)+' '+G.y0.toFixed(1);
    for(var y=G.y0+12;y<G.y1;y+=12){d+=' L'+riverX(y).toFixed(1)+' '+y.toFixed(1)}
    d+=' L'+riverX(G.y1).toFixed(1)+' '+G.y1.toFixed(1);
    riverPaths.forEach(function(p){p.setAttribute('d',d)});
    var w1='M'+riverX(G.y0).toFixed(1)+' '+G.y0.toFixed(1),w2=w1;
    for(var yy=G.y0+5;yy<G.y1;yy+=5){
      var bx=riverX(yy);
      w1+=' L'+(bx+2.6*Math.sin(yy/6.1)+1.4*Math.sin(yy/2.9+1)).toFixed(1)+' '+yy.toFixed(1);
      w2+=' L'+(bx-2.8*Math.sin(yy/7.3+2)-1.2*Math.sin(yy/3.4)).toFixed(1)+' '+yy.toFixed(1);
    }
    $('#riverSheen').setAttribute('d',w1);$('#riverGlint').setAttribute('d',w2);
    var half=narrow?6.2:9.4,r1='M'+(riverX(G.y0)+4).toFixed(1)+' '+G.y0.toFixed(1),r2='M'+(riverX(G.y0)-4).toFixed(1)+' '+G.y0.toFixed(1),
        b1='M'+(riverX(G.y0)+half).toFixed(1)+' '+G.y0.toFixed(1),b2='M'+(riverX(G.y0)-half).toFixed(1)+' '+G.y0.toFixed(1);
    for(var y3=G.y0+5;y3<G.y1;y3+=5){
      var cx3=riverX(y3);
      r1+=' L'+(cx3+4+2.2*Math.sin(y3/5.2+0.6)).toFixed(1)+' '+y3.toFixed(1);
      r2+=' L'+(cx3-4-2.2*Math.sin(y3/6.4+3)).toFixed(1)+' '+y3.toFixed(1);
      b1+=' L'+(cx3+half+0.9*Math.sin(y3/9)).toFixed(1)+' '+y3.toFixed(1);
      b2+=' L'+(cx3-half+0.9*Math.sin(y3/11+2)).toFixed(1)+' '+y3.toFixed(1);
    }
    $('#riverRip1').setAttribute('d',r1);$('#riverRip2').setAttribute('d',r2);$('#riverBank1').setAttribute('d',b1);$('#riverBank2').setAttribute('d',b2);
    var hd=heroD(narrow);
    heroPaths.forEach(function(p){p.setAttribute('d',hd)});
    var fg=$('#heroFadeG');fg.setAttribute('y1',(G.hs.y-6).toFixed(1));fg.setAttribute('y2',(G.hs.y+110).toFixed(1));

    var stops=$$('.stop').filter(function(el){return !el.hidden});
    G.stops=stops.map(function(el){
      var cls=Array.prototype.find.call(el.classList,function(c){return SEASONS.indexOf(c)>-1});
      var top=rel(el,journey);
      return {el:el,id:el.id,season:cls,top:top,bottom:top+el.offsetHeight,
              color:getComputedStyle(el).getPropertyValue('--river').trim()};
    });
    grad.setAttribute('y2',H);
    while(grad.firstChild)grad.removeChild(grad.firstChild);
    G.stops.forEach(function(s){
      var h=s.bottom-s.top;
      [s.top+h*0.3,s.bottom-h*0.3].forEach(function(p){
        var st=document.createElementNS('http://www.w3.org/2000/svg','stop');
        st.setAttribute('offset',Math.max(0,Math.min(1,p/H)).toFixed(4));
        st.setAttribute('stop-color',s.color);
        grad.appendChild(st);
      });
    });

    $$('.buoy').forEach(function(b){b.remove()});
    $$('[data-buoy]').forEach(function(el){
      var stop=el.closest('.stop'),y=anchorY(el),b=document.createElement('div');
      var v=el.getAttribute('data-buoy');
      b.className='buoy'+(v==='start'?' ring':'');
      if(v!=='start')b.textContent=v;
      b.style.left=riverX(y).toFixed(1)+'px';
      b.style.top=(y-rel(stop,journey)).toFixed(1)+'px';
      b.setAttribute('aria-hidden','true');
      stop.appendChild(b);
    });
    G.ok=true;G.season=null;G.id=null;
    paint();
  }

  var nav=$$('.menu a');
  function paint(){
    if(!G.ok)return;
    var sy=window.scrollY,vh=window.innerHeight;
    var py=Math.max(G.y0,Math.min(G.y1,sy+vh*0.6-G.top));
    clipRect.setAttribute('height',py.toFixed(1));
    boat.setAttribute('transform','translate('+riverX(py).toFixed(1)+' '+py.toFixed(1)+')');
    brandEl.classList.toggle('is-off',sy<heroPh.offsetHeight*0.8);
    var probeY=sy+vh*0.4-G.top,cur=G.stops[0];
    G.stops.forEach(function(s){if(probeY>=s.top)cur=s});
    if(cur.season!==G.season){
      SEASONS.forEach(function(c){root.classList.remove(c)});
      root.classList.add(cur.season);
      G.season=cur.season;
    }
    if(cur.id!==G.id){
      nav.forEach(function(a){a.classList.toggle('on',a.getAttribute('data-g')===cur.id)});
      var menuEl=document.querySelector('.menu');
      nav.forEach(function(a){
        if(a.getAttribute('data-g')===cur.id&&menuEl){
          var t=a.offsetLeft-(menuEl.clientWidth-a.offsetWidth)/2;
          if(menuEl.scrollTo)menuEl.scrollTo({left:Math.max(0,t),behavior:'smooth'});else menuEl.scrollLeft=Math.max(0,t);
        }
      });
      G.id=cur.id;
    }
  }
  var ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){ticking=false;paint()});
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',layout);
  window.addEventListener('load',layout);
  if(window.ResizeObserver)new ResizeObserver(layout).observe(journey);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);

  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var t=document.getElementById(a.getAttribute('href').slice(1));
      if(!t)return;
      e.preventDefault();
      if(t.hidden){t.hidden=false;layout()}
      t.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    });
  });

  if(location.hash==='#allyear'){var ay=document.getElementById('allyear');if(ay){ay.hidden=false;layout()}}

  // Räppli confetti (small paper discs)
  var rap=$('#rappli'),seed=7,cols=['#FF4F8B','#FFC53D','#2FD3C0','#8A6CFF'];
  function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
  for(var i=0;i<44;i++){
    var e=document.createElement('i'),z=5+rnd()*6;
    e.style.cssText='left:'+(rnd()*100).toFixed(1)+'%;top:'+(rnd()*100).toFixed(1)+'%;width:'+z.toFixed(1)+'px;height:'+z.toFixed(1)+'px;background:'+cols[i%4]+';animation-delay:-'+(rnd()*8).toFixed(1)+'s';
    rap.appendChild(e);
  }

  // Morgestraich: lights out
  var btn=$('#lightsBtn'),stage=$('#stage'),night=$('#fasnacht'),msg=$('#lightsMsg');
  btn.addEventListener('click',function(){
    var on=btn.getAttribute('aria-pressed')!=='true';
    btn.setAttribute('aria-pressed',on?'true':'false');
    stage.classList.toggle('is-dark',on);
    night.classList.toggle('is-dark',on);
    btn.textContent=on?'Switch the lights back on':'Switch the lights off';
    msg.textContent=on
      ?'Everything goes dark. Then the cliques arrive with their lanterns.'
      :'The old town is lit up. Press the switch.';
  });

  function wave(y,x0){return 'M'+x0+' '+y+' q12 -7 24 0'+' t24 0'.repeat(20)}

  // Herbstmesse: Ferris wheel, cabins stay upright
  var wSvg=$('#wheelSvg'),wRot=$('#wheelRot'),wCabs=$('#wheelCabs');
  var SVGNS='http://www.w3.org/2000/svg',WX=100,WY=96,WR=80,WN=10,cabEls=[];
  function svgEl(name,attrs,parent){
    var n=document.createElementNS(SVGNS,name);
    for(var k in attrs)n.setAttribute(k,attrs[k]);
    parent.appendChild(n);return n;
  }
  for(var s=0;s<WN;s++){
    var sa=s*2*Math.PI/WN;
    svgEl('line',{'class':'spoke',x1:WX,y1:WY,x2:(WX+WR*Math.cos(sa)).toFixed(1),y2:(WY+WR*Math.sin(sa)).toFixed(1)},wRot);
  }
  for(var b=0;b<30;b++){
    var ba=b*2*Math.PI/30;
    svgEl('circle',{'class':'bulb',cx:(WX+WR*Math.cos(ba)).toFixed(1),cy:(WY+WR*Math.sin(ba)).toFixed(1),r:1.9,
      style:'animation-delay:-'+((b%7)*0.2).toFixed(1)+'s'},wRot);
  }
  for(var c=0;c<WN;c++){
    var g=svgEl('g',{},wCabs);
    svgEl('path',{'class':'pole',d:'M0 0V4'},g);
    svgEl('path',{'class':'cabroof',d:'M-8 4.5L0 0.5L8 4.5Z'},g);
    svgEl('rect',{'class':'cabin',x:-7,y:4.5,width:14,height:10,rx:2.5},g);
    cabEls.push(g);
  }
  var wAng=0,wSpin=!reduce,wVis=false,wLoop=false,wLast=0;
  function drawWheel(){
    wRot.setAttribute('transform','rotate('+wAng.toFixed(2)+' '+WX+' '+WY+')');
    cabEls.forEach(function(g,i){
      var a=(wAng+i*360/WN-90)*Math.PI/180;
      g.setAttribute('transform','translate('+(WX+WR*Math.cos(a)).toFixed(1)+' '+(WY+WR*Math.sin(a)).toFixed(1)+')');
    });
  }
  function wTick(t){
    if(!wLoop)return;
    var dt=Math.min(0.05,(t-wLast)/1000);wLast=t;
    wAng=(wAng+dt*9)%360;drawWheel();
    requestAnimationFrame(wTick);
  }
  function wSync(){
    var want=wSpin&&wVis;
    if(want&&!wLoop){wLoop=true;wLast=performance.now();requestAnimationFrame(wTick)}
    else if(!want){wLoop=false}
  }
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){wVis=es[0].isIntersecting;wSync()}).observe(wSvg);
  }else{wVis=true}
  drawWheel();wSync();

  // Christmas stall: bulbs along the wire, falling snow
  var xWire=$('#xWire'),xLights=$('#xLights'),xSnow=$('#xSnow');
  if(xWire&&xLights){
    var xLen=xWire.getTotalLength(),xCols=['#FFD36B','#FF6B4A','#FFF3DC','#7FE0B0'];
    for(var q=0;q<14;q++){
      var pt=xWire.getPointAtLength(xLen*(q+0.5)/14);
      svgEl('circle',{'class':'xb',cx:pt.x.toFixed(1),cy:(pt.y+3).toFixed(1),r:3.2,fill:xCols[q%4],style:'animation-delay:-'+((q%5)*0.35).toFixed(2)+'s'},xLights);
    }
  }
  if(xSnow){
    for(var f=0;f<46;f++){
      var fl=document.createElement('i'),fz=2+rnd()*3.5;
      fl.style.cssText='left:'+(rnd()*100).toFixed(1)+'%;width:'+fz.toFixed(1)+'px;height:'+fz.toFixed(1)+'px;--dx:'+Math.round(rnd()*40-20)+'px;animation-duration:'+(6+rnd()*7).toFixed(1)+'s;animation-delay:-'+(rnd()*12).toFixed(1)+'s';
      xSnow.appendChild(fl);
    }
  }


  // All year round: places grouped by category
  var CATS=['Coffee','Dinner','Bars','Shopping','Museums','Walk'];
  var CAT_TITLE={Coffee:'Coffee',Dinner:'Dinner',Bars:'Bars',Shopping:'Shopping',Museums:'Museums',Walk:'Streets and places to walk'};
  var PL={
    Coffee:[['Daniska'],["Milo’s Cookies"],['For Art Café Bar'],['Café am Rhy'],['Frühling'],['Smilla'],["Dan’s Lab"],['Unternehmen Mitte'],['Van by St. Pauls'],['Café Bar Rosenkranz'],['La Manufacture'],['La Sprezza'],['Läckerli Huus'],['Confiserie Schiesser'],['Sprüngli'],['Les Trois Rois','Afternoon tea'],['Café Vonlanthen','Totentanz'],['Café Papiermühle','St. Alban'],['Mystifry','Vegan doughnuts'],['Das Café des Arts','Grand piano']],
    Dinner:[['Izakaya Miake'],['Peng Dumplings'],['Vito'],['Burgermeister'],['Noohn'],['Chez Donati'],['Taverne Johann'],['Acqua'],['Le Rhin Bleu'],['Rhywyera'],["Lily’s"],['Nam Soup Bar'],['Spark','Portuguese'],['Bodega zum Strauss'],['Markthalle Basel'],['Restaurant Kunsthalle'],['Fischerstube'],['Gifthüttli'],['Safran-Zunft'],['Zum Goldenen Sternen'],['Stucki Bruderholz'],['Cheval Blanc','Les Trois Rois'],['Zum Goldenen Fass','Kleinbasel'],['Bohemia','Brasserie'],['Brasserie at Volkshaus Basel','Kleinbasel'],['Löwenzorn','Swiss'],['Manger & Boire','Italian-inspired'],['ONO'],['Restaurant Atelier'],['Restaurant Bel Étage'],['Schlüsselzunft','Swiss'],['Ufer7','Kleinbasel, tapas'],['Ackermannshof','St. Johann']],
    Bars:[['Cargo Bar'],['Amber Bar'],['Les Trois Rois','Bar'],['Unternehmen Mitte'],['Hirscheneck'],['Parterre One'],['Bar Rouge'],['Steinenvorstadt','The strip'],['Baltazar','Gin and live music'],['Campari Bar'],['The Bird’s Eye Jazz Club','Jazz'],['Matt & Elly Brewery','Kleinbasel'],['Sperber','Pub with jazz'],['Consum Winebar','By the Rhine'],['Blaupause','Cocktails'],['Kulturbeiz 113','Rooftop']],
    Shopping:[['Freie Strasse'],['Gerbergasse'],['Spalenberg'],['Rheinsprung'],['Globus'],['Manor'],['Bider & Tanner'],['Greifengasse','Kleinbasel'],['Clarastrasse'],['Glausi’s','Cheese, Spalenberg'],['Spielegge','Toys, Spalenberg'],['Naked','Young designers'],['Riviera','Kleinbasel'],['Johann Wanner','Christmas ornaments'],['Confiserie Bachmann','Truffles'],['Basel unverpackt','Zero waste'],['Claudia Güdel','Clothing'],['Bercher & Sternlicht','Model trains']],
    Museums:[['Kunstmuseum Basel','Art, old and modern'],['Fondation Beyeler','Riehen'],['Museum Tinguely','Kinetic art'],['Vitra Design Museum','Weil am Rhein, Germany'],['Antikenmuseum Basel','Ancient art'],['Historisches Museum Basel','Barfüsserkirche'],['Naturhistorisches Museum','Dinosaurs and mammoths'],['Papiermühle Basel','Make your own paper'],['Cartoonmuseum Basel','Caricature and comics'],['Spielzeug Welten Museum','Toys and teddy bears'],['Museumsnacht','Late January, until 2 am']],
    Walk:[['Spalenberg'],['Münsterplatz and the Pfalz'],['Marktplatz'],['St. Alban-Tal'],['Oberer Rheinweg'],['Steinenvorstadt'],['Mittlere Brücke','Old Rhine bridge'],['Tinguely Fountain','Theaterplatz'],['Petersplatz'],['Dreiländereck','Where three countries meet at the Rhine']]
  };
  var PR={Coffee:{'Daniska':1,'Milo\u2019s Cookies':1,'For Art Caf\u00e9 Bar':1,'Caf\u00e9 am Rhy':1,'Fr\u00fchling':1,'Smilla':1,'Dan\u2019s Lab':1,'Unternehmen Mitte':1,'Van by St. Pauls':1,'Caf\u00e9 Bar Rosenkranz':1,'La Manufacture':1,'La Sprezza':1,'L\u00e4ckerli Huus':1,'Confiserie Schiesser':2,'Spr\u00fcngli':2,'Les Trois Rois':3,'Café Vonlanthen':1,'Café Papiermühle':1,'Mystifry':1,'Das Café des Arts':1},
    Dinner:{'Izakaya Miake':2,'Peng Dumplings':1,'Vito':2,'Burgermeister':2,'Noohn':2,'Chez Donati':3,'Taverne Johann':2,'Acqua':3,'Le Rhin Bleu':2,'Rhywyera':2,'Lily\u2019s':2,'Nam Soup Bar':1,'Spark':2,'Bodega zum Strauss':2,'Markthalle Basel':1,'Restaurant Kunsthalle':2,'Fischerstube':2,'Gifth\u00fcttli':2,'Safran-Zunft':3,'Zum Goldenen Sternen':2,'Stucki Bruderholz':3,'Cheval Blanc':3,'Zum Goldenen Fass':2,'Bohemia':2,'Brasserie at Volkshaus Basel':2,'Löwenzorn':2,'Manger & Boire':1,'ONO':2,'Restaurant Atelier':2,'Restaurant Bel Étage':3,'Schlüsselzunft':3,'Ufer7':2,'Ackermannshof':3},
    Bars:{'Cargo Bar':2,'Amber Bar':3,'Les Trois Rois':3,'Unternehmen Mitte':2,'Hirscheneck':1,'Parterre One':2,'Bar Rouge':3,'Steinenvorstadt':2,'Baltazar':2,'Campari Bar':2,'The Bird’s Eye Jazz Club':2,'Matt & Elly Brewery':2,'Sperber':1,'Consum Winebar':2,'Blaupause':2,'Kulturbeiz 113':1},
    Museums:{'Kunstmuseum Basel':2,'Fondation Beyeler':3,'Museum Tinguely':2,'Vitra Design Museum':3,'Antikenmuseum Basel':2,'Historisches Museum Basel':2,'Naturhistorisches Museum':1,'Papiermühle Basel':2,'Cartoonmuseum Basel':2,'Spielzeug Welten Museum':2,'Museumsnacht':2},
    Shopping:{'Globus':3,'Manor':2,'Bider & Tanner':2,'Glausi’s':2,'Spielegge':2,'Naked':2,'Riviera':2,'Johann Wanner':2,'Confiserie Bachmann':2,'Basel unverpackt':2,'Claudia Güdel':3,'Bercher & Sternlicht':2},Walk:{}};
  var pr=0,pBtns=[];
  function fr(n){return n?new Array(n+1).join('$'):''}
  [[0,'All'],[1,'$'],[2,'$$'],[3,'$$$']].forEach(function(x){
    var b=document.createElement('button');b.type='button';b.className='fbtn';b.textContent=x[1];b.setAttribute('aria-pressed',x[0]===pr?'true':'false');
    b.addEventListener('click',function(){pr=x[0];pBtns.forEach(function(y){y.b.setAttribute('aria-pressed',y.v===pr?'true':'false')});renderPlaces()});
    pBtns.push({b:b,v:pr===x[0]?x[0]:x[0]});$('#fPrice').appendChild(b);
  });
  var cat='',cBtns=[],listEl=$('#plist');
  function mkb(label,v){
    var b=document.createElement('button');b.type='button';b.className='fbtn';b.textContent=label;b.setAttribute('aria-pressed',v===cat?'true':'false');
    b.addEventListener('click',function(){cat=v;cBtns.forEach(function(x){x.b.setAttribute('aria-pressed',x.v===cat?'true':'false')});renderPlaces()});
    cBtns.push({b:b,v:v});$('#fCat').appendChild(b);
  }
  mkb('All','');CATS.forEach(function(c){mkb(c==='Walk'?'Walks':c,c)});
  function renderPlaces(){
    listEl.textContent='';
    CATS.forEach(function(c){
      if(cat&&cat!==c)return;
      var g=document.createElement('section');g.className='pgroup';
      var h=document.createElement('div');h.className='pgroup__h';
      var t=document.createElement('h3');t.textContent=CAT_TITLE[c];
      var n=document.createElement('span');
      h.appendChild(t);h.appendChild(n);g.appendChild(h);
      var l=document.createElement('div');l.className='plist';
      var shown=0;
      PL[c].forEach(function(it){
        var pv=PR[c][it[0]]||0;
        if(pr&&pv!==pr)return;
        shown++;
        var r=document.createElement('div');r.className='pitem';
        var b=document.createElement('b');b.textContent=it[0];r.appendChild(b);
        var sp=document.createElement('span');
        if(it[1]){sp.appendChild(document.createTextNode(it[1]+(pv?' \u00b7 ':'')))}
        if(pv){var pe=document.createElement('em');pe.textContent=fr(pv);sp.appendChild(pe)}
        if(sp.childNodes.length)r.appendChild(sp);
        l.appendChild(r);
      });
      n.textContent=shown+(shown===1?' PLACE':' PLACES');
      if(!shown)return;
      g.appendChild(l);listEl.appendChild(g);
    });
  }
  renderPlaces();

  layout();
})();
