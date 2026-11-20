(function(){
  var STORIES=[
    {t:"The Worst Field Trip",d:"A school bus, a mystery and lunch",
     x:"Our class went to the [place] on a [adjective] Monday. The bus driver, [name], let us bring our pet [animal] along. Halfway there, someone yelled “[silly word]!” and the bus began to [verb]. Our teacher grabbed a [noun] and tried to [verb]. By lunchtime we had eaten [number] [plural noun], and everyone agreed it was the most [adjective] trip ever."},
    {t:"Alien Landing",d:"They come in peace. Mostly.",
     x:"Breaking news! A [adjective] spaceship has landed in [place]. Out stepped an alien named [name], wearing a [noun] on its head. It looked at the crowd and said, “Take me to your [noun].” Then it began to [verb] [adverb] and gave everyone a free [food]. Scientists say the alien has [number] [body part]s and is “totally harmless.”"},
    {t:"Kitchen Disaster",d:"Do not try this at home",
     x:"Today I am making [food] for [name]. First, preheat the oven to [number] degrees. Then [verb] two cups of [plural noun] in a [adjective] bowl. Add a pinch of [noun] and stir [adverb]. Suddenly the kitchen smelled like [place]! My [body part] was covered in [food], but the dinner was still delicious."},
    {t:"Superhero Audition",d:"Powers, capes and one big problem",
     x:"Hello, my name is [name] and I want to be a superhero. My power is the ability to [verb] any [noun] from [number] miles away. My costume is a [adjective] cape and boots made of [plural noun]. My sidekick is a [adjective] [animal] named [silly word]. I will protect [place] from every villain, [adverb]!"}
  ];
  var HINTS={"noun":"table, balloon, sock","plural noun":"shoes, robots, clouds","verb":"jump, sneeze, dance","adjective":"slimy, tiny, glittery","adverb":"loudly, slowly, politely","name":"any person’s name","place":"the moon, a bakery","number":"any number","body part":"elbow, nose, knee","food":"pizza, noodles, cake","animal":"llama, squirrel","silly word":"zibbledoo, flarp"};

  var app=document.getElementById("app");
  var story=null,parts=[],slots=[],answers=[],step=0;

  function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
  function btn(text,cls,fn){var b=el("button","btn "+(cls||""),text);b.type="button";b.addEventListener("click",fn);return b}
  function article(w){return /^[aeiou]/i.test(w)?"an ":"a "}
  function clear(){while(app.firstChild)app.removeChild(app.firstChild);window.scrollTo(0,0)}
  function stopSpeech(){if(window.speechSynthesis)speechSynthesis.cancel()}

  function home(){
    clear();story=null;
    app.appendChild(el("h1",null,"Mad Libs"));
    app.appendChild(el("p",null,"Fill in the words without seeing the story, then read what you made. Pick a story to start."));
    var list=el("div","stories");
    STORIES.forEach(function(s){
      var b=el("button","btn story",s.t);b.type="button";
      b.appendChild(el("small",null,s.d));
      b.addEventListener("click",function(){start(s)});
      list.appendChild(b);
    });
    app.appendChild(list);
    app.appendChild(btn("Surprise me","main",function(){start(STORIES[Math.floor(Math.random()*STORIES.length)])}));
  }

  function start(s){
    story=s;parts=s.x.split(/\[([^\]]+)\]/);slots=[];
    for(var i=1;i<parts.length;i+=2)slots.push(parts[i]);
    answers=[];step=0;ask();
  }

  function ask(){
    clear();
    var kind=slots[step];
    app.appendChild(el("h2",null,story.t));
    app.appendChild(el("p","soft","Word "+(step+1)+" of "+slots.length));
    var bar=el("div","bar");var fill=el("i");bar.appendChild(fill);app.appendChild(bar);
    setTimeout(function(){fill.style.width=(step/slots.length*100)+"%"},20);

    var label=el("label",null,"Give me "+article(kind)+kind);label.setAttribute("for","w");
    var input=el("input");input.type="text";input.id="w";input.autocomplete="off";input.autocapitalize="off";input.spellcheck=false;
    input.value=answers[step]||"";
    var hint=el("p","soft","Ideas: "+(HINTS[kind]||"anything goes"));
    var err=el("p","err");
    app.appendChild(label);app.appendChild(input);app.appendChild(err);app.appendChild(hint);

    function next(){
      var v=input.value.trim();
      if(!v){err.textContent="Type a word first. Silly is good.";input.focus();return}
      answers[step]=v;step++;
      if(step>=slots.length)reveal();else ask();
    }
    input.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();next()}});
    app.appendChild(btn(step===slots.length-1?"Show my story":"Next word","main",next));
    if(step>0)app.appendChild(btn("Back","",function(){var v=input.value.trim();if(v)answers[step]=v;step--;ask()}));
    app.appendChild(btn("Quit","",home));
    input.focus();
  }

  function reveal(){
    clear();
    app.appendChild(el("h2",null,story.t));
    var box=el("p","story-text");
    var plain="";
    for(var i=0;i<parts.length;i++){
      if(i%2===0){
        var seg=parts[i];
        var nextWord=parts[i+1]!==undefined?answers[i/2]:null;
        if(nextWord&&/\ba $/i.test(seg)&&/^[aeiou]/i.test(nextWord))seg=seg.replace(/a $/i,function(m){return m[0]+"n "});
        box.appendChild(document.createTextNode(seg));plain+=seg;
      }else{
        var w=answers[(i-1)/2];
        var s=el("span","fill",w);s.style.setProperty("--i",(i-1)/2);
        box.appendChild(s);plain+=w;
      }
    }
    app.appendChild(box);
    var row=el("div");
    app.appendChild(row);
    row.appendChild(btn("Read it aloud","main",function(){
      if(!window.speechSynthesis)return;
      speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(plain));
    }));
    row.appendChild(btn("Same story, new words","",function(){stopSpeech();start(story)}));
    row.appendChild(btn("Pick another","",function(){stopSpeech();home()}));
    requestAnimationFrame(function(){requestAnimationFrame(function(){box.classList.add("show")})});
  }

  home();
})();
