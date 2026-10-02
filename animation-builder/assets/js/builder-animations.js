let animatedElements = new Set(); 

function makeTransformableIfNeeded(el) {
  if (el instanceof jQuery) {
    el = el[0];
  }

  if (!(el instanceof Element)) return;

  const display = window.getComputedStyle(el).display;
  if (display === "inline") {
    gsap.set(el, { display: "inline-block" });
  }
}

window.renderAbAnimations = function(animationData, refresh = false) {

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    
    if(refresh){
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        gsap.globalTimeline.getChildren().forEach(tl => tl.kill());
        animatedElements.forEach(element => {
            gsap.set(element, { clearProps: "all" });
        });
        animatedElements.clear();
    }
    
    const animationSets = ['global', 'page'];

    animationSets.forEach(setKey => {

        if (animationData[setKey]) { 
            
            for (const [key, properties] of Object.entries(animationData[setKey])) {

                let mediaQuery = "";
                if (properties.disable_below && properties.disable_above) {
                    mediaQuery = `(min-width: ${properties.disable_below}px) and (max-width: ${properties.disable_above}px)`;
                } else if (properties.disable_below) {
                    mediaQuery = `(min-width: ${properties.disable_below}px)`;
                } else if (properties.disable_above) {
                    mediaQuery = `(max-width: ${properties.disable_above}px)`;
                } else {
                    mediaQuery = "all";
                }
                
                mm.add(mediaQuery, () => {

                    const stages = properties.stages;

                    let scrub = false;
                    let end_trigger_point = false;
                    let end_trigger = false;
                    let play_once = false;
                    let toggle_actions =  "play play play reverse";

                    if(properties.play_once){
                        play_once = true;
                        toggle_actions = "play none none none";
                    }


                    if (properties.scrub) {
                        scrub = properties.scrub_delay ? properties.scrub_delay / 1000 : true;
                        end_trigger_point = properties.scrub_trigger_point + " " + properties.scrub_viewport_point;
                        end_trigger = properties.trigger;
                    }

                    
                    jQuery(properties.trigger).each(function(){
                        const triggerElement = this; 
                        var selector = null;
                        var tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: triggerElement,
                                start: properties.trigger_point + " " + properties.viewport_point,
                                toggleActions: toggle_actions, 
                                scrub: scrub,
                                end_trigger: end_trigger,
                                end: end_trigger_point,
                                once: play_once
                            }
                        });

                        if(properties.selection == 'simple'){
                            
                            let props = {};
                            props.duration = .75;
                            if (properties.opacity) props.opacity = properties.opacity / 100;
                            if (properties.positionx) props.x = properties.positionx;
                            if (properties.positiony) props.y = properties.positiony;
                            if (properties.stagger) props.stagger = properties.stagger / 1000;
                            if (properties.duration) props.duration = properties.duration / 1000;
                            if (properties.scalex) props.scaleX = properties.scalex / 100;
                            if (properties.scaley) props.scaleY = properties.scaley / 100;
                            if (properties.rotate) props.rotation = properties.rotate;
                            if (properties.color) props.color = properties.color;
                            if (properties.backgroundColor) props.backgroundColor = properties.backgroundColor;
                            props.onStart = function() {
                                this.targets().forEach(el => el.classList.add("ab-animation-triggered"));
                            }
                            props.onReverseComplete = function() {
                                this.targets().forEach(el => el.classList.remove("ab-animation-triggered"));
                            }

                            // Track the current element
                            animatedElements.add(triggerElement);

                            if(properties.animation_type == 'from'){
                                makeTransformableIfNeeded(triggerElement);
                                tl.from(triggerElement, props);
                            }else{
                                makeTransformableIfNeeded(triggerElement);
                                tl.to(triggerElement, props);
                            }
                        }else{
                            if(stages){
                                stages.forEach(stage => {
                                    let props = {};
                                    props.duration = .75;
                                    if (stage.opacity) props.opacity = stage.opacity / 100;
                                    if (stage.positionx) props.x = stage.positionx;
                                    if (stage.positiony) props.y = stage.positiony;
                                    if (stage.stagger) props.stagger = stage.stagger / 1000;
                                    if (stage.duration) props.duration = stage.duration / 1000;
                                    if (stage.delay) props.delay = stage.delay / 1000;
                                    if (stage.scalex) props.scaleX = stage.scalex / 100;
                                    if (stage.scaley) props.scaleY = stage.scaley / 100;
                                    if (stage.rotate) props.rotation = stage.rotate;
                                    if (stage.color) props.color = stage.color;
                                    if (stage.backgroundColor) props.backgroundColor = stage.backgroundColor;

                                    if(stage.animate_trigger){
                                        selector = jQuery(triggerElement);
                                    }else if(stage.trigger_child){
                                        selector = jQuery(triggerElement).find(stage.trigger);
                                    } else {
                                        selector = jQuery(stage.trigger);
                                    }
                                    
                                    // Track all matched elements
                                    selector.each(function() {
                                        animatedElements.add(this);
                                    });

                                    if(stage.overlap){
                                        var overlap = '<';
                                    }else{
                                        var overlap = '>';
                                    }

                                    if(stage.animation_type == 'from'){
                                        makeTransformableIfNeeded(selector);
                                        tl.from(selector, props, overlap);
                                    }else{
                                        makeTransformableIfNeeded(selector);
                                        tl.to(selector, props, overlap);
                                    }
                                });
                                
                            }
                        }
                    });
                    
                });
            }
        }
    });
}

renderAbAnimations(anibu);