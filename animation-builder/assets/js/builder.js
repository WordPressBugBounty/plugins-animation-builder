jQuery(window).ready(function(){
        const originalContent = jQuery('body').children().not('#ab-app').detach();

        const { createApp, ref, defineComponent } = Vue

        const SpectrumColorInput = defineComponent({
            template: `
                <div class="ab-color-input-grid" style="--ab-transparent:url(${anibu.anibu_directory}assets/images/transparent.svg)">
                    <div class="ab-color-input-preview">
                        <input type="text" class="ab-spectrum-color-input" ref="colorInput" :value="modelValue"placeholder="#RRGGBB or transparent">
                        <div class="ab-color-input-preview-color">{{modelValue}}</div>
                    </div>
                    <div class="ab-unset" v-if="modelValue" @click="updateColor(null)">Clear</div>
                    <div class="ab-no-change" v-if="!modelValue">Unset</div>
                </div>
            `,
            props: {
                modelValue: {
                    type: [String, null],
                    default: null
                }
            },
            emits: ['update:modelValue'],
            data() {
                return {
                    isUpdating: false
                }
            },
            mounted() {
                const self = this;
                jQuery(this.$refs.colorInput).spectrum({
                    color: this.modelValue || '',
                    flat: false,
                    showInput: true,
                    showInitial: true,
                    allowEmpty: true,
                    preferredFormat: "hex",
                    
                    change: function(color) {
                        self.isUpdating = true;
                        const newColor = color ? color.toHexString() : null;
                        self.updateColor(newColor);
                        self.$nextTick(() => {
                            self.isUpdating = false;
                        });
                    }
                });

                if (this.modelValue) {
                    jQuery(this.$refs.colorInput).spectrum("set", this.modelValue);
                }
                jQuery('.sp-container').css({'--ab-transparent': `url(${anibu.anibu_directory}assets/images/transparent.svg)`});
            },
            beforeUnmount() {
                if (jQuery(this.$refs.colorInput).data('spectrum')) {
                    jQuery(this.$refs.colorInput).spectrum("destroy");
                }
            },
            watch: {
                modelValue(newValue) {
                    if (!this.isUpdating) {
                        if (newValue) {
                            jQuery(this.$refs.colorInput).spectrum("set", newValue);
                        } else {
                            jQuery(this.$refs.colorInput).spectrum("set", "");
                        }
                    }
                }
            },
            methods: {
                updateColor(newValue) {
                    this.$emit('update:modelValue', newValue);
                }
            }
        });

        const InputWithUnit = defineComponent({
            template: `
                <div class="ab-input-with-unit-selector">
                    <input type="number" class="ab-stage-positing-input" ref="input" :value="value" @input="updateValue($event.target.value)" >
                    <div class="ab-unit-selector" @click="getNewUnit()" style="--icon:url(${anibu.anibu_directory}assets/images/arrows-up-down.svg);">{{unit}}</div>
                </div>
            `,
            props: {
                modelValue: { 
                    type: [String, Number],
                    default: null
                }
            },
            emits: ['update:modelValue'],
            data() {
                return {
                    unit: 'px',
                    value: null
                }
            },
            mounted() {
                this.parseModelValue(this.modelValue);
            },
            watch: {
                modelValue(newValue) {
                    this.parseModelValue(newValue);
                }
            },
            methods: {
                parseModelValue(val) {
                    if (val === null) {
                        this.value = null;
                        return; 
                    }

                    const strVal = String(val);
                    const numMatch = strVal.match(/^-?\d*\.?\d*/); 
                    const unitMatch = strVal.match(/[^0-9.]+$/); 
                    this.value = numMatch && numMatch[0] !== '' ? numMatch[0] : null;
                    this.unit = unitMatch ? unitMatch[0] : 'px';

                    if (this.$refs.input) {
                        this.$refs.input.value = this.value;
                    }
                },
                getNewUnit() {
                    if(this.unit === '%'){
                        this.unit = 'px';
                    }else if(this.unit === 'px'){
                        this.unit = 'vw';
                    }else if(this.unit === 'vw'){
                        this.unit = 'vh';
                    }else if(this.unit === 'vh'){
                        this.unit = '%';
                    }
                    
                    if(this.value !== null && this.value !== ''){
                        this.$emit('update:modelValue', this.value + this.unit);
                    } else {
                        this.$emit('update:modelValue', null);
                    }
                },
                updateValue(newValue) {
                    this.value = newValue
                    
                    if(this.value !== null && this.value !== ''){
                        this.$emit('update:modelValue', this.value + this.unit);
                    }else{
                        this.$emit('update:modelValue', null);
                    }
                }
            }
        });

        const InlineDropdown = defineComponent({
        template: `
                <div class="ab-inline-dropdown" ref="dropdown">
                    <div class="ab-inline-dropdown-current" style="--bg-image:url(${anibu.anibu_directory}assets/images/inline-dropdown-icon.svg)" @click="active = !active">
                        <div class="ab-inline-dropdown-current-inner">
                            {{ selectedOption }}
                         </div>
                    </div>
                    <div class="ab-inline-dropdown-options" v-if="active">
                        <div class="ab-inline-dropdown-options-inner">
                            <div
                                v-for="option in options"
                                :key="option"
                                :class=" option === selectedOption ? 'ab-inline-dropdown-option-selected ab-inline-dropdown-option ab-interactive' : 'ab-inline-dropdown-option ab-interactive' "
                                @click="selectOption(option)"
                            >
                                {{ option }}
                            </div>

                            <div v-if="custom" class="ab-inline-dropdown-option">
                                a custom amount
                                <div class="ab-custom-input-wrapper">
                                    <div class="ab-custom-input ab-input-with-unit-selector">
                                        <input type="number" @input="custom_value = $event.target.value" :value="custom_value"  min="0" max="100">
                                        <div class="ab-unit-selector" @click="getNewUnit()" style="--icon:url(${anibu.anibu_directory}assets/images/arrows-up-down.svg);">{{custom_value_unit}}</div>
                                    </div>
                                    <div class="ab-custom-input-submit" @click="saveCustomValue()" style="--bg-image:url(${anibu.anibu_directory}assets/images/check.svg)"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            `,
            props: {
                options: {
                    type: Array,
                    required: true
                },
                modelValue: {
                    type: String,
                    default: null
                },
                custom: {
                    type: Boolean,
                    default: false
                }
            },
            emits: ['update:modelValue'],
            data() {
                return {
                    selectedOption: this.modelValue || this.options[0],
                    active: false,
                    custom_value: null,
                    custom_value_unit: '%',
                    useCustomValue: false,
                    customValueString: null
                }
            },
            mounted() {
                document.addEventListener('click', this.closeOnOutsideClick);
            },
            beforeUnmount() {
                document.removeEventListener('click', this.closeOnOutsideClick);
            },
            methods: {
                selectOption(option) {
                    this.selectedOption = option;
                    this.active = false;
                    this.$emit('update:modelValue', option);
                },
                saveCustomValue() {
                    if(this.custom_value){
                        this.useCustomValue = true;
                        this.customValueString = this.custom_value + this.custom_value_unit;
                        this.selectedOption = this.customValueString;
                        this.active = false;
                        this.$emit('update:modelValue', this.customValueString);
                    }
                }, 
                getNewUnit() {
                    if(this.custom_value_unit === '%'){
                        this.custom_value_unit = 'px';
                    }else if(this.custom_value_unit === 'px'){
                        this.custom_value_unit = 'vw';
                    }else if(this.custom_value_unit === 'vw'){
                        this.custom_value_unit = 'vh';
                    }else if(this.custom_value_unit === 'vh'){
                        this.custom_value_unit = '%';
                    }
                },
                closeOnOutsideClick(event) {
                    if (this.active && this.$refs.dropdown && !this.$refs.dropdown.contains(event.target)) {
                        this.active = false;
                    }
                }
            },
            watch: {
                modelValue(newVal) {
                    // Update the local selectedOption when the modelValue prop changes externally
                    this.selectedOption = newVal;
                }
            }
        });

        const appTemplate = `
            <div :class="builder_closed ? 'ab-app-wrapper ab-builder-closed' : 'ab-app-wrapper'">
                <div class="ab-header ab-builder-item">
                    <div class="ab-header-logo"><img src="${anibu.anibu_directory}assets/images/logo-white.svg"></div>
                    <div class="ab-header-bar">Previewing: <span class="ab-page-link">${anibu.page_url}</span></div>
                    <a :href="anibu.page_url" class="ab-close" style="background-image:url(${anibu.anibu_directory}assets/images/close.svg)"></a>
                </div>
                <div class="ab-builder-grid">
                    <div :class="(!this.animation.valid_trigger && ! this.animation.trigger && this.animation.type) || hasOpenStageTriggerSelect ? 'ab-builder-preview ab-selecting-trigger' : 'ab-builder-preview '" ref="preview" style="--ab-cursor:url(${anibu.anibu_directory}assets/images/target-dark.png)"></div>
                </div>
                <div id="ab-builder-sidebar" class="ab-builder-item">
                    <div class="ab-sidebar-close" @click="toggleBuilder();" style="--closed-icon:url(${anibu.anibu_directory}assets/images/chevron-white.svg);--open-icon:url(${anibu.anibu_directory}assets/images/icon-dark-alt.svg);"></div>
                    <div class="ab-type-selects" v-if="gsap_installed && gsap_scroll_trigger_installed">
                        <div :class="['ab-type-select', tab == 'all' ? 'ab-active' : '']"  @click="setTab('all')">All</div>
                        <div :class="['ab-type-select', tab == 'page' ? 'ab-active' : '']"  @click="setTab('page')">Page</div>
                        <div :class="['ab-type-select', tab == 'global' ? 'ab-active' : '']" @click="setTab('global')">Global <div class="pro-ad">PRO</div></div>
                    </div>
                    <div v-if="!gsap_installed || !gsap_scroll_trigger_installed" class="ab-builder-gsap-installation">
                        <div class="ab-builder-gsap-header">
                            <div class="ab-large-title">Get Started</div>
                            <div class="ab-content">Animation Builder requires a few external assets to function. Paste the links to the libraries below, or simply click Install to use the default CDN versions from cdnjs:</div>
                        </div>
                        <div v-if="cdn_form_submitted" class="ab-gsap-errors">
                            <div class="ab-gsap-error" v-if="!gsap_installed || !gsap_scroll_trigger_installed">Unable to establish a connection with the provided CDN. Please see the sections highlighted in red below.</div>
                        </div>
                        <form @submit.prevent="saveLibrarySettings()">
                            <div class="ab-title">GSAP Animation library</div>
                            <input type="text" :class="((!gsap_installed && cdn_form_submitted ? 'ab-error-highlight ' : '') + (gsap_installed && cdn_form_submitted ? 'ab-success-highlight' : ''))" v-model="gsap_url">
                            <div class="ab-title">GSAP Scroll-trigger library</div>
                            <input type="text" :class="((!gsap_scroll_trigger_installed && cdn_form_submitted ? 'ab-error-highlight ' : '') + (gsap_scroll_trigger_installed && cdn_form_submitted ? 'ab-success-highlight' : ''))" v-model="gsap_scroll_trigger_url">
                            <button class="ab-button" type="submit">Install</button>
                        </form>
                        <div class="ab-gsap-notice">Note: You may want to host these libraries on your own server or CDN for improved reliability and performance.</div>
                    </div>
                    <div class="ab-builder-sidebar-scroll" v-if="gsap_installed && gsap_scroll_trigger_installed">
                        <div class="ab-no-animations" v-if="page_animations.length == 0 && !animation.type && tab == 'page' && ! animation.selection || global_animations.length == 0 && !animation.type && tab == 'global' && ! animation.selection && anibu.pro || page_animations.length == 0 && global_animations.length == 0 && !animation.type && tab == 'all' && ! animation.selection || tab == 'all' && page_animations.length == 0 && ! anibu.pro && ! animation.selection">
                            <img src="${anibu.anibu_directory}assets/images/no-animations.svg">
                            <div class="ab-no-animations-text">
                                <div class="ab-title">No <span v-if="tab !== 'all'">{{tab}}</span> animations have been created yet.</div>
                                Use animation builder to create new animations <br>and they will appear here.
                            </div>
                        </div>

                        <div class="ab-pro-upgrade-area" v-if="tab == 'global' && ! anibu.pro">
                            <div class="ab-title">Upgrade to PRO</div>
                            <div class="ab-pro-upgrade-text">Want animations that work across your whole site? Upgrade to <strong>PRO</strong> and set them up just once! Your animations will sync across every page automatically—no more repeating the same setup.</div>
                            <div class="ab-pro-upgrade-table" style="--check-white:url(${anibu.anibu_directory}assets/images/check.svg);--check-yellow:url(${anibu.anibu_directory}assets/images/check-yellow.svg)">
                                <div class="ab-pro-row ab-pro-row-head">
                                    <div class="ab-pro-row-header"></div>
                                    <div class="ab-pro-row-header">Standard</div>
                                    <div class="ab-pro-row-header"><div class="pro-ad">PRO</div></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Ready-to-use classes 
                                        <span data-tooltip="Apply scroll-triggered animations instantly using our ready-to-use CSS classes." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Simple animations 
                                        <span data-tooltip="Use our simple animation builder to create simple animations with limited controls." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Advanced Timeline Builder 
                                        <span data-tooltip="Build complex, multi-stage animations using our visual timeline builder." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Legacy animations 
                                        <span data-tooltip="Automatically activate elements on scroll, allowing you to apply your own CSS transitions." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Page animations 
                                        <span data-tooltip="Set up animations that run on individual pages with full customization." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Global animations 
                                        <span data-tooltip="Enable animations that automatically run across your entire website." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Stage Delay 
                                        <span data-tooltip="Add delays between stages within your timeline animations for precise timing." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Scrub Delay 
                                        <span data-tooltip="Create smooth scroll-based animations with controlled scrubbing." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Run once 
                                        <span data-tooltip="Ensure animations play only once when they appear, without repeating on scroll." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Disable by screen width 
                                        <span data-tooltip="Control when animations run based on device screen size—disable on mobile or desktop as needed." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <div class="ab-pro-row">
                                    <div class="ab-pro-row-label">
                                        Extended support 
                                        <span data-tooltip="Get enhanced support for your animations and additional PRO features." 
                                            class="ab-tooltip-indicator" 
                                            style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)">
                                        </span>
                                    </div>
                                    <div class="ab-pro-row-value"></div>
                                    <div class="ab-pro-row-value ab-yes"></div>
                                </div>

                                <a href="https://toastplugins.co.uk/plugins/animation-builder/" target="_blank" class="ab-button">Upgrade now</a>
                            </div>
                            
                        </div>
                        

                        <div v-if="!animation.type && ! animation.selection && tab == 'global' && anibu.pro || !animation.type && ! animation.selection && tab !== 'global'" class="ab-animation-list-area-wrapper">
                            <div class="ab-animation-list-area" v-if="page_animations.length !== 0 && !animation.type && tab == 'page' && ! animation.selection || page_animations.length !== 0 && !animation.type && tab == 'all' && ! animation.selection">
                                <div class="ab-animation-list">
                                    <div v-for="animation in page_animations" class="ab-animation-list-item">
                                        <div class="ab-animation-list-item-header">
                                            <div class="ab-animation-list-item-title" v-if="animation.name">{{animation.name}}</div>
                                            <div class="ab-animation-list-item-actions">
                                                <div class="ab-animation-list-item-delete" @click="deleteAnimation(animation.id)">Delete</div>
                                                <div v-if="!animation.scrub" class="ab-animation-list-item-refresh" @click="refreshAnimations()">Preview</div>
                                                <div class="ab-animation-list-item-edit" @click="editAnimation(animation)">Edit</div>
                                            </div>
                                        </div>
                                        <div class="ab-animation-list-item-content">
                                            <div class="ab-animation-list-item-meta">
                                                <div class="ab-list-item-meta-line" v-if="animation.selection == 'simple'">Simple animation</div> <div class="ab-list-item-meta-line" v-else>Advanced Timeline</div>
                                                <div class="ab-list-item-meta-line" v-if="animation.stages">{{animation.stages.length}} <span v-if="animation.stages.length == 1">stage</span><span v-else>stages</span></div><div class="ab-list-item-meta-line" v-else>1 stage</div>
                                                <div class="ab-list-item-meta-line scrub" v-if="animation.scrub">Scrub</div>
                                            </div>
                                            <div class="ab-last-editted-by"><span v-if="animation.new">Created</span><span v-if="!animation.new">Updated</span> {{formatDate(animation.updated_at)}} by {{animation.user_email}}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="ab-animation-list-area" v-if="global_animations.length !== 0 && !animation.type && tab == 'global' && ! animation.selection && anibu.pro || global_animations.length !== 0 && !animation.type && tab == 'all' && ! animation.selection && anibu.pro">
                                <div class="ab-animation-list">
                                    <div v-for="animation in global_animations" class="ab-animation-list-item">
                                            <div class="ab-animation-list-item-header">
                                            <div class="ab-animation-list-item-title" v-if="animation.name">{{animation.name}}</div>
                                            <div class="ab-animation-list-item-actions">
                                                <div class="ab-animation-list-item-delete" @click="deleteAnimation(animation.id)">Delete</div>
                                                <div v-if="!animation.scrub" class="ab-animation-list-item-refresh" @click="refreshAnimations()">Preview</div>
                                                <div class="ab-animation-list-item-edit" @click="editAnimation(animation)">Edit</div>
                                            </div>
                                        </div>
                                        <div class="ab-animation-list-item-content">
                                            <div class="ab-animation-list-item-meta">
                                                <div class="ab-list-item-meta-line global">Globalised</div>
                                                <div class="ab-list-item-meta-line" v-if="animation.selection == 'simple'">Simple animation</div> <div class="ab-list-item-meta-line" v-else>Advanced Timeline</div>
                                                <div class="ab-list-item-meta-line" v-if="animation.stages">{{animation.stages.length}} <span v-if="animation.stages.length == 1">stage</span><span v-else>stages</span></div><div class="ab-list-item-meta-line" v-else>1 stage</div>
                                                <div class="ab-list-item-meta-line scrub" v-if="animation.scrub">Scrub</div>
                                            </div>
                                            <div class="ab-last-editted-by"><span v-if="animation.new">Created</span><span v-if="!animation.new">Updated</span> {{formatDate(animation.updated_at)}} by {{animation.user_email}}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="ab-button" @click="animation.selection = 'initial'">Add a new {{type}} animation +</div>
                        </div>

                        <div class="ab-animation-selection" v-if="animation.selection == 'initial'">

                            <div class="ab-configuration-title">What type of animation would you like to add?</div>
                            <div class="ab-animation-selection-options">
                                <div class="ab-animation-selection-option" @click="addSimpleAnimation()">
                                    <div class="ab-animation-selection-option-icon"><img src="${anibu.anibu_directory}assets/images/build.svg"></div>
                                    <div class="ab-animation-selection-option-content">
                                        <div class="ab-animation-selection-option-title">Simple builder</div>
                                        <div class="ab-animation-selection-option-description">Create a simple transition. Limited controls but easy to configure.</div>
                                            <div class="ab-skill-grid">
                                            <div class="ab-skill-title">Skill required</div>
                                            <div class="ab-skill-bar"><div class="ab-skill-bar-fill small"></div></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="ab-animation-selection-option" @click="addTimelineAnimation()">
                                    <div class="ab-animation-selection-option-icon"><img src="${anibu.anibu_directory}assets/images/timeline.svg"></div>
                                    <div class="ab-animation-selection-option-content">
                                        <div class="ab-animation-selection-option-title">Advanced Timeline builder</div>
                                        <div class="ab-animation-selection-option-description">A more complex animation type allowing you to achieve many different effects and control many different elements from one trigger.</div>
                                            <div class="ab-skill-grid">
                                            <div class="ab-skill-title">Skill required</div>
                                            <div class="ab-skill-bar"><div class="ab-skill-bar-fill high"></div></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ab-configuration" v-if="animation.type && animation.selection == 'simple'">
                            <div class="ab-configuration-header">
                                <div class="ab-configuration-top">
                                    <div class="ab-configuration-title">
                                        <span v-if="! animation.name">Configure your simple animation</span>
                                        <span v-if="animation.name">Configure: {{animation.name}}</span>
                                    </div>
                                    <div class="ab-configuration-close" style="background-image:url(${anibu.anibu_directory}assets/images/close.svg)" @click="closeConfiguration()"></div>

                                    <div class="ab-row">
                                        <div class="ab-label-area">
                                            <span class="ab-label">Animated Element <span data-tooltip="The element you want to animate" class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></span>
                                            <span class="ab-error" v-if="!animation.valid_trigger && animation.trigger">Element not found</span>
                                        </div>
                                        <div :class="['ab-trigger-select', animation.valid_trigger || ! animation.trigger ? 'ab-valid' : 'ab-invalid']">
                                            <div class="ab-trigger-select-icon" @click="animation.trigger = null"><img src="${anibu.anibu_directory}assets/images/target.svg"></div>
                                            <input :value="animation.trigger" @input="animation.trigger = $event.target.value" type="text" class="ab-trigger-select-input" placeholder="Click an element in the preview, or enter a CSS selector">
                                        </div>
                                    </div>
                                </div>

                                <div class="ab-simple-animation-select" v-if="animation.valid_trigger">

                                    <div :class="preset_panel_activated ? 'ab-preset-row ab-active' : 'ab-preset-row'">
                                        <div class="ab-value" ref="presetArea">
                                            <div class="ab-preset-wrapper" @click="preset_panel_activated = true">
                                                <div class="ab-preset-search-input-wrapper">
                                                    <input class="ab-preset-search" type="text" v-model="preset_search" :placeholder="preset_panel_activated ? 'Search...' : 'Select a preset animation'">
                                                </div>
                                                <div class="ab-preset-list">
                                                    <div class="ab-preset-list-scroll">
                                                        <div v-for="preset in filteredPresets" v-if="filteredPresets" :key="preset.id" @click="selectPreset(preset)" class="ab-preset-item">
                                                            <div class="ab-preset-name">{{ preset.presetName }}</div>
                                                        </div>
                                                        <div v-if="! filteredPresets" class="ab-preset-empty">
                                                            <div class="ab-preset-icon"><img src="${anibu.anibu_directory}assets/images/no-animations.svg"></div>
                                                            <div class="ab-preset-name">No presets found. Please amend your search</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 
                                    </div>

                                    <div v-if="animation.preset_selected">
                                        <div class="ab-option-row" >
                                            <div class="ab-label">Animation Type <span data-tooltip="‘To’ animations transition an element from its current state to the properties you specify, whereas ‘From’ animations start with the properties you define and animate back to the element’s original state. In other words, with a ‘to’ animation, you define how the element will look at the end of the animation. With a ‘from’ animation, you define how it will look at the start." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <div class="ab-value">
                                                <InlineDropdown :options="['to', 'from']" v-model="animation.animation_type" />
                                            </div> 
                                        </div>
                                
                                        <div class="ab-stage-properties">
                                                                
                                            <div class="ab-stage-property">
                                                <div class="ab-stage-label" @click="controls.opacity.open = !controls.opacity.open" v-if="!controls.opacity.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/opacity.svg"> Opacity <span v-if="animation.opacity" class="ab-configured">Configured</span></div>
                                                <div class="ab-stage-label" @click="controls.opacity.open = !controls.opacity.open" v-if="controls.opacity.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/opacity.svg"> Opacity</div>
                                                <div class="ab-stage-property-controls" v-if="controls.opacity.open">
                                                    <div class="ab-range-slider">
                                                        <input type="range" min="0" max="100" :value="animation.opacity" @input="animation.opacity = $event.target.value">
                                                        <div class="ab-value">
                                                            <span v-if="animation.opacity">{{animation.opacity}}% <span class="ab-unset" @click="animation.opacity = null">Unset</span></span>
                                                            <span v-if="!animation.opacity">No change</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="ab-stage-property">
                                                <div class="ab-stage-label" @click="controls.positioning.open = !controls.positioning.open" v-if="!controls.positioning.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/position.svg">Positioning <span v-if="animation.positionx || animation.positiony" class="ab-configured">Configured</span></div>
                                                <div class="ab-stage-label" @click="controls.positioning.open = !controls.positioning.open" v-if="controls.positioning.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/position.svg"> Positioning</div>
                                                <div class="ab-stage-property-controls" v-if="controls.positioning.open">
                                                    <div class="ab-stage-position-fields">
                                                        <div class="ab-stage-position-field">
                                                            <div class="ab-secondary-label">X Axis</div>
                                                            <InputWithUnit v-model="animation.positionx" />
                                                        </div>
                                                        <div class="ab-stage-position-field">
                                                            <div class="ab-secondary-label">Y Axis</div>
                                                            <InputWithUnit v-model="animation.positiony" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="ab-stage-property">
                                                <div class="ab-stage-label" @click="controls.scale.open = !controls.scale.open" v-if="!controls.scale.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/scale.svg"> Scale <span v-if="animation.scalex || animation.scaley" class="ab-configured">Configured</span></div>
                                                <div class="ab-stage-label" @click="controls.scale.open = !controls.scale.open" v-if="controls.scale.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/scale.svg"> Scale</div>
                                                <div class="ab-stage-property-controls" v-if="controls.scale.open">

                                                    <div class="ab-stage-position-fields">
                                                        <div class="ab-stage-position-field">
                                                            <div class="ab-secondary-label">Scale X</div>
                                                            <div class="ab-custom-input">
                                                                <input type="number" :value="animation.scalex" @input="animation.scalex = $event.target.value" placeholder="0">
                                                                <div class="ab-unit-selector">%</div>
                                                            </div>
                                                        </div>
                                                        <div class="ab-stage-position-field">
                                                            <div class="ab-secondary-label">Scale Y</div>
                                                                <div class="ab-custom-input">
                                                                <input type="number" :value="animation.scaley" @input="animation.scaley = $event.target.value" placeholder="0">
                                                                <div class="ab-unit-selector">%</div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>

                                            <div class="ab-stage-property">
                                                <div class="ab-stage-label" @click="controls.rotation.open = !controls.rotation.open" v-if="!controls.rotation.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/rotate.svg"> Rotation <span v-if="animation.rotate || animation.rotate" class="ab-configured">Configured</span></div>
                                                <div class="ab-stage-label" @click="controls.rotation.open = !controls.rotation.open" v-if="controls.rotation.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/rotate.svg"> Rotation</div>
                                                <div class="ab-stage-property-controls" v-if="controls.rotation.open">

                                                        <div class="ab-secondary-label">Rotation</div>
                                                        <div class="ab-custom-input">
                                                            <input type="number" :value="animation.rotate" @input="animation.rotate = $event.target.value" placeholder="0">
                                                            <div class="ab-unit-selector">deg</div>
                                                        </div>

                                                </div>
                                            </div>

                                            <div class="ab-stage-property">
                                                <div class="ab-stage-label" @click="controls.color.open = !controls.color.open" v-if="!controls.color.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/color.svg"> Color <span v-if="animation.color || animation.backgroundColor" class="ab-configured">Configured</span></div>
                                                <div class="ab-stage-label" @click="controls.color.open = !controls.color.open" v-if="controls.color.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/color.svg"> Color</div>
                                                <div class="ab-stage-property-controls" v-if="controls.color.open">
                                                    <div class="ab-color-options">
                                                        <div class="ab-color-option">
                                                            <div class="ab-secondary-label">Text Color</div>
                                                            <SpectrumColorInput v-model="animation.color" />
                                                        </div>
                                                        <div class="ab-color-option">
                                                            <div class="ab-secondary-label">Background Color</div>
                                                            <SpectrumColorInput v-model="animation.backgroundColor" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>


                                </div>
                                <div v-if="animation.valid_trigger && animation.preset_selected">
                                    <div class="ab-option-row">
                                        <div class="ab-label">Duration</div>
                                        <div class="ab-custom-input ab-small">
                                            <input type="number" :value="animation.duration" @input="animation.duration = $event.target.value" placeholder="750">
                                            <div class="ab-unit-selector">ms</div>
                                        </div>
                                    </div>

                                    <div class="ab-option-row ab-pro-option" @click="upgradeToPro()">
                                        <div class="ab-label">Run once? <span data-tooltip="By default animations will play every time the trigger element hits the trigger point. Enable this option to disable this and only allow the animation to play the first time the trigger point is reached." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                        <input type="checkbox" class="ab-checkbox" :checked="animation.play_once" @click="animation.play_once = !animation.play_once" >
                                    </div>

                                    <div class="ab-option-row ab-pro-option" @click="upgradeToPro()">
                                        <div class="ab-label">Globalised? <span data-tooltip="Enable this to run the animation on every page of your site, saving you from having to set it up on each page individually." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                        <input type="checkbox" class="ab-checkbox" :checked="animation.type == 'global'" value="" v-model="animation.global" @change="animation.type = animation.global ? 'global' : 'page'" >
                                    </div>

                                    <div class="ab-animation-main-controls" v-if="!hasOpenStage">
                                        <div class="ab-option-row ab-name">
                                            <div class="ab-label">Name your animation* <span data-tooltip="Give your animation a name to make it easier to identify later." class="ab-tooltip-indicator ab-up" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <input type="text" placeholder="Name this animation" :value="animation.name" @input="animation.name = capitalizeFirstLetter($event.target.value)" class="ab-input ab-name-input">
                                        </div>
                                        <div class="ab-animation-main-controls-grid">
                                            <div :class="animation.deleting ? 'ab-button ab-button-red ab-button-loading ab-inline-button' : 'ab-button ab-button-red ab-inline-button'" @click="deleteAnimation(animation.id)">Delete animation</div>
                                            <div class="ab-button ab-refresh-button ab-button-grey ab-inline-button" @click="refreshAnimations"><img src="${anibu.anibu_directory}assets/images/play.svg"> Preview</div>
                                            <div :class="animation.saving ? 'ab-button ab-button-loading ab-inline-button' : 'ab-button ab-inline-button'" @click="saveAnimation">Save</div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>


                        <div class="ab-configuration" v-if="animation.type && animation.selection !== 'simple'">
                            <div class="ab-configuration-header">
                                <div class="ab-configuration-top">
                                    <div class="ab-configuration-title">
                                        <span v-if="! animation.name">Configure your timeline animation</span>
                                        <span v-if="animation.name">Configure: {{animation.name}}</span>
                                    </div>
                                    <div class="ab-configuration-close" style="background-image:url(${anibu.anibu_directory}assets/images/close.svg)" @click="closeConfiguration()"></div>

                                    <div class="ab-row">
                                        <div class="ab-label-area">
                                            <span class="ab-label">Trigger Element <span data-tooltip="The element that will be used to calculate the start position of the animation timeline." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></span>
                                            <span class="ab-error" v-if="!animation.valid_trigger && animation.trigger">Element not found</span>
                                        </div>
                                        <div :class="['ab-trigger-select', animation.valid_trigger || ! animation.trigger ? 'ab-valid' : 'ab-invalid']">
                                            <div class="ab-trigger-select-icon" @click="animation.trigger = null"><img src="${anibu.anibu_directory}assets/images/target.svg"></div>
                                            <input :value="animation.trigger" @input="animation.trigger = $event.target.value" type="text" class="ab-trigger-select-input" placeholder="Click an element in the preview, or enter a CSS selector">
                                        </div>
                                    </div>

                                    <div class="ab-playback-controls" v-if="animation.valid_trigger">
                                        When <span v-if="animation.trigger_point == 'center' || animation.trigger_point == 'bottom' || animation.trigger_point == 'top'">the </span>
                                        <InlineDropdown :options="['top', 'center', 'bottom']" v-model="animation.trigger_point" :custom="true" />
                                        of the trigger element reaches <span v-if="animation.viewport_point == 'center' || animation.viewport_point == 'bottom' || animation.viewport_point == 'top'">the </span>
                                        <InlineDropdown :options="['top', 'center', 'bottom']" v-model="animation.viewport_point" :custom="true" />
                                        of the viewport, run the timeline below.
                                    </div>
                                </div>

                                <div class="ab-timeline-wrapper" v-if="animation.valid_trigger">

                                    <div class="ab-stages" ref="stagesList">
                                        
                                        <div v-for="stage in animation.stages" :key="stage.id" class="ab-stage">
                                            <div class="ab-stage-inner" >
                                                
                                                <div class="ab-stage-handle" v-if="!hasOpenStage">
                                                    <img src="${anibu.anibu_directory}assets/images/drag-handle.svg">
                                                </div>

                                                <div class="ab-stage-open" v-if="stage.open">

                                                    <div class="ab-row" v-if="! stage.animate_trigger">
                                                        <div class="ab-label-area">
                                                            <span class="ab-label">Animated Element(s) <span data-tooltip="The element you'd like to be animated. You can select multiple elements by separating them with a comma or use generic selectors to target multiple elements." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></span>
                                                            <span class="ab-error" v-if="!stage.valid_trigger && stage.trigger">Element not found <span v-if="stage.trigger_child">in trigger</span></span>
                                                        </div>
                                                        <div :class="['ab-trigger-select', stage.valid_trigger || ! stage.trigger ? 'ab-valid' : 'ab-invalid']">
                                                            <div class="ab-trigger-select-icon" @click="stage.trigger = null"><img src="${anibu.anibu_directory}assets/images/target.svg"></div>
                                                            <input :value="stage.trigger" @input="stage.trigger = $event.target.value" type="text" class="ab-trigger-select-input" placeholder="Click an element in the preview, or enter a CSS selector">
                                                        </div>
                                                    </div>

                                                    <div class="ab-option-row ab-option-row-large">
                                                        <div class="ab-label">Animate Trigger Itself? <span data-tooltip="Check this to animate the trigger element itself." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                        <input type="checkbox" class="ab-checkbox" :checked="stage.animate_trigger" @click="stage.animate_trigger = !stage.animate_trigger" >
                                                    </div>

                                                    <div class="ab-option-row" v-if="! stage.animate_trigger">
                                                        <div class="ab-label">Child of trigger? <span data-tooltip="Check this if the animated element is a child of the trigger element. Uncheck this if the animated element sits outside of the triggers elements hierarcacal structure." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                        <input type="checkbox" class="ab-checkbox" :checked="stage.trigger_child" @click="stage.trigger_child = !stage.trigger_child" >
                                                    </div>

                                                    <div class="ab-stage-controls" v-if="stage.valid_trigger">
                                                        
                                                        <div class="ab-option-row">
                                                            <div class="ab-label">Animation Type <span data-tooltip="‘To’ animations transition an element from its current state to the properties you specify, whereas ‘From’ animations start with the properties you define and animate back to the element’s original state. In other words, with a ‘to’ animation, you define how the element will look at the end of the animation. With a ‘from’ animation, you define how it will look at the start." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                            <div class="ab-value">
                                                                <InlineDropdown :options="['to', 'from']" v-model="stage.animation_type" />
                                                            </div> 
                                                        </div>

                                                        <div class="ab-stage-properties">
                                                            
                                                            <div class="ab-stage-property">
                                                                <div class="ab-stage-label" @click="controls.opacity.open = !controls.opacity.open" v-if="!controls.opacity.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/opacity.svg"> Opacity <span v-if="stage.opacity" class="ab-configured">Configured</span></div>
                                                                <div class="ab-stage-label" @click="controls.opacity.open = !controls.opacity.open" v-if="controls.opacity.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/opacity.svg"> Opacity</div>
                                                                <div class="ab-stage-property-controls" v-if="controls.opacity.open">
                                                                    <div class="ab-range-slider">
                                                                        <input type="range" min="0" max="100" :value="stage.opacity" @input="stage.opacity = $event.target.value">
                                                                        <div class="ab-value">
                                                                            <span v-if="stage.opacity">{{stage.opacity}}% <span class="ab-unset" @click="stage.opacity = null">Unset</span></span>
                                                                            <span v-if="!stage.opacity">No change</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="ab-stage-property">
                                                                <div class="ab-stage-label" @click="controls.positioning.open = !controls.positioning.open" v-if="!controls.positioning.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/position.svg"> Positioning <span v-if="stage.positionx || stage.positiony" class="ab-configured">Configured</span></div>
                                                                <div class="ab-stage-label" @click="controls.positioning.open = !controls.positioning.open" v-if="controls.positioning.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/position.svg"> Positioning</div>
                                                                <div class="ab-stage-property-controls" v-if="controls.positioning.open">
                                                                    <div class="ab-stage-position-fields">
                                                                        <div class="ab-stage-position-field">
                                                                            <div class="ab-secondary-label">X Axis</div>
                                                                            <InputWithUnit v-model="stage.positionx" />
                                                                        </div>
                                                                        <div class="ab-stage-position-field">
                                                                            <div class="ab-secondary-label">Y Axis</div>
                                                                            <InputWithUnit v-model="stage.positiony" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="ab-stage-property">
                                                                <div class="ab-stage-label" @click="controls.scale.open = !controls.scale.open" v-if="!controls.scale.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/scale.svg"> Scale <span v-if="stage.scalex || stage.scaley" class="ab-configured">Configured</span></div>
                                                                <div class="ab-stage-label" @click="controls.scale.open = !controls.scale.open" v-if="controls.scale.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/scale.svg"> Scale</div>
                                                                <div class="ab-stage-property-controls" v-if="controls.scale.open">

                                                                    <div class="ab-stage-position-fields">
                                                                        <div class="ab-stage-position-field">
                                                                            <div class="ab-secondary-label">Scale X</div>
                                                                            <div class="ab-custom-input">
                                                                                <input type="number" :value="stage.scalex" @input="stage.scalex = $event.target.value" placeholder="0">
                                                                                <div class="ab-unit-selector">%</div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="ab-stage-position-field">
                                                                            <div class="ab-secondary-label">Scale Y</div>
                                                                            <div class="ab-custom-input">
                                                                                <input type="number" :value="stage.scaley" @input="stage.scaley = $event.target.value" placeholder="0">
                                                                                <div class="ab-unit-selector">%</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <div class="ab-stage-property">
                                                                <div class="ab-stage-label" @click="controls.rotation.open = !controls.rotation.open" v-if="!controls.rotation.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/rotate.svg"> Rotation <span v-if="stage.rotate || stage.rotate" class="ab-configured">Configured</span></div>
                                                                <div class="ab-stage-label" @click="controls.rotation.open = !controls.rotation.open" v-if="controls.rotation.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/rotate.svg"> Rotation</div>
                                                                <div class="ab-stage-property-controls" v-if="controls.rotation.open">

                                                                        <div class="ab-secondary-label">Rotation</div>
                                                                        <div class="ab-custom-input">
                                                                            <input type="number" :value="stage.rotate" @input="stage.rotate = $event.target.value" placeholder="0">
                                                                            <div class="ab-unit-selector">deg</div>
                                                                        </div>

                                                                </div>
                                                            </div>

                                                            <div class="ab-stage-property">
                                                                <div class="ab-stage-label" @click="controls.color.open = !controls.color.open" v-if="!controls.color.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/plus-white.svg)"><img src="${anibu.anibu_directory}assets/images/color.svg"> Color <span v-if="stage.color || stage.background_color" class="ab-configured">Configured</span></div>
                                                                <div class="ab-stage-label" @click="controls.color.open = !controls.color.open" v-if="controls.color.open" style="--bg-image:url(${anibu.anibu_directory}assets/images/minus-white.svg)"><img src="${anibu.anibu_directory}assets/images/color.svg"> Color</div>
                                                                <div class="ab-stage-property-controls" v-if="controls.color.open">
                                                                    <div class="ab-color-options">
                                                                        <div class="ab-color-option">
                                                                            <div class="ab-secondary-label">Text Color</div>
                                                                            <SpectrumColorInput v-model="stage.color" />
                                                                        </div>
                                                                        <div class="ab-color-option">
                                                                            <div class="ab-secondary-label">Background Color</div>
                                                                            <SpectrumColorInput v-model="stage.backgroundColor" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>

                                                        <div class="ab-option-row" v-if="! animation.scrub">
                                                            <div class="ab-label">Duration</div>
                                                            <div class="ab-custom-input ab-small">
                                                                <input type="number" :value="stage.duration" @input="stage.duration = $event.target.value" placeholder="750">
                                                                <div class="ab-unit-selector">ms</div>
                                                            </div>
                                                        </div>

                                                        <div class="ab-option-row">
                                                            <div class="ab-label">Stagger time <span data-tooltip="When multiple elements are targeted within this stage, the stagger property allows you to animate them with a timed delay between each element, creating a cascading or sequential effect. Rather than animating all elements simultaneously, stagger automatically offsets their start times, giving the animation a smooth, flowing rhythm." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                            <div class="ab-custom-input ab-small">
                                                                <input type="number" :value="stage.stagger" @input="stage.stagger = $event.target.value" placeholder="0">
                                                                <div class="ab-unit-selector">ms</div>
                                                            </div> 
                                                        </div>

                                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()" v-if="! animation.scrub">
                                                            <div class="ab-label">Delay <span data-tooltip="Add a delay that is either offset at the beginning of the trigger event or after the previous stage has completed." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                            <div class="ab-custom-input ab-small">
                                                                <input type="number" :value="stage.delay" @input="stage.delay = $event.target.value" placeholder="0">
                                                                <div class="ab-unit-selector">ms</div>
                                                            </div> 
                                                        </div>

                                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()" v-if="animation.stages[0] != stage">
                                                            <div class="ab-label">Overlap Stage <span data-tooltip="By default, stages run sequentially. Enable this option to start this stage concurrently with the previous one, allowing both to run simultaneously." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                            <input type="checkbox" class="ab-checkbox" :checked="stage.overlap" @click="stage.overlap = !stage.overlap " >
                                                        </div>


                                                    </div>

                                                    
                                                    <div class="ab-row ab-align-right ab-stage-footer">
                                                        <div class="ab-button ab-inline-button ab-button-red" @click="removeStage(stage)">Remove stage</div>
                                                        <div v-if="! animation.scrub" class="ab-button ab-refresh-button ab-button-grey ab-inline-button" @click="refreshAnimations"><img src="${anibu.anibu_directory}assets/images/play.svg"> Preview</div>
                                                        <div v-if="animation.scrub" class="ab-button ab-refresh-button ab-button-grey ab-inline-button ab-button-disabled"><img src="${anibu.anibu_directory}assets/images/play.svg"> Scroll page to preview scrub</div>
                                                        <div class="ab-button ab-inline-button" @click="saveStage(stage)">Save</div>
                                                    </div>

                                                </div>

                                                <div class="ab-stage-closed" v-if="!stage.open">
                                                    <div class="ab-stage-closed-trigger">
                                                        <div v-if="stage.animate_trigger">
                                                            <span class="ab-faded-text">Targeting</span> <span class="ab-trigger-text">{trigger}</span> <span class="ab-faded-text">itself</span>
                                                        </div>
                                                        <div v-if="! stage.animate_trigger">
                                                            <span class="ab-faded-text" v-if="! stage.trigger_child">any</span> {{stage.trigger}} <span class="ab-faded-text" v-if="stage.trigger_child">child of </span><span class="ab-trigger-text" v-if="stage.trigger_child">{trigger}</span>
                                                        </div>


                                                    </div>
                                                    <div class="ab-stage-icons">
                                                        <img src="${anibu.anibu_directory}assets/images/opacity.svg" v-if="stage.opacity">
                                                        <img src="${anibu.anibu_directory}assets/images/position.svg" v-if="stage.positionx || stage.positiony">
                                                        <img src="${anibu.anibu_directory}assets/images/scale.svg" v-if="stage.scalex || stage.scaley">
                                                        <img src="${anibu.anibu_directory}assets/images/rotate.svg" v-if="stage.rotate">
                                                        <img src="${anibu.anibu_directory}assets/images/color.svg" v-if="stage.color || stage.backgroundColor">
                                                    </div>
                                                    <div class="ab-stage-closed-edit" v-if="!hasOpenStage" @click="stage.open = true">
                                                        Edit
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div class="ab-add-stage" v-if="!hasOpenStage">
                                            <div class="ab-button ab-add-stage-button" @click="addStageToAnimation()"><img src="${anibu.anibu_directory}assets/images/plus-white.svg"> Add stage to timeline</div>
                                        </div>

                                    </div>

                                    <div class="ab-animation-additonal-options" v-if="animation.stages.length">
                                        
                                        <div class="ab-option-row">
                                            <div class="ab-label">Scrub? <span data-tooltip="By default, animations play fully when the trigger element reaches the set point. Enabling this option will prevent the animation from running completely, instead playing it proportionally to how much you've scrolled." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <input type="checkbox" class="ab-checkbox" :checked="animation.scrub" @click="animation.scrub = !animation.scrub; refreshAnimations()" >
                                        </div>

                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()" v-if="animation.scrub">
                                            <div class="ab-label">Scrub delay <span data-tooltip="By default, animations play each time the trigger element reaches the trigger point. Enable this option to restrict the animation to play only the first time the trigger point is reached." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <div class="ab-custom-input ab-small">
                                                <input type="number" :value="animation.scrub_delay" @input="animation.scrub_delay = $event.target.value" placeholder="0">
                                                <div class="ab-unit-selector">ms</div>
                                            </div> 
                                        </div>

                                        <div class="ab-scrub-controls ab-playback-controls" v-if="animation.scrub">
                                            Stop animating when <span v-if="animation.scrub_trigger_point == 'center' || animation.scrub_trigger_point == 'bottom' || animation.scrub_trigger_point == 'top'">the </span>
                                            <InlineDropdown :options="['top', 'center', 'bottom']" v-model="animation.scrub_trigger_point" :custom="true" />
                                            of the trigger element reaches <span v-if="animation.scrub_viewport_point == 'center' || animation.scrub_viewport_point == 'bottom' || animation.scrub_viewport_point == 'top'">the </span>
                                            <InlineDropdown :options="['top', 'center', 'bottom']" v-model="animation.scrub_viewport_point" :custom="true" />
                                            of the viewport.
                                        </div>

                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()" v-if="! animation.scrub">
                                            <div class="ab-label">Run once? <span data-tooltip="By default animations will play every time the trigger element hits the trigger point. Enable this option to disable this and only allow the animation to play the first time the trigger point is reached." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <input type="checkbox" class="ab-checkbox" :checked="animation.play_once" @click="animation.play_once = !animation.play_once" >
                                        </div>

                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()">
                                            <div class="ab-label">Globalised? <span data-tooltip="Enable this to run the animation on every page of your site, saving you from having to set it up on each page individually." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <input type="checkbox" class="ab-checkbox" :checked="animation.type == 'global'" value="" v-model="animation.global" @change="animation.type = animation.global ? 'global' : 'page'" >
                                        </div>

                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()">
                                            <div class="ab-label">Disable below <span data-tooltip="Enter a value here to have the animation play only on screens wider than the specified width." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <div class="ab-custom-input ab-small">
                                                <input type="number" :value="animation.disable_below" @input="animation.disable_below = $event.target.value" placeholder="0">
                                                <div class="ab-unit-selector">px</div>
                                            </div> 
                                        </div>

                                        <div class="ab-option-row ab-pro-option" @click="upgradeToPro()">
                                            <div class="ab-label">Disable above <span data-tooltip="Enter a value here to have the animation play only on screens narrower than the specified width." class="ab-tooltip-indicator" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                            <div class="ab-custom-input ab-small">
                                                <input type="number" :value="animation.disable_above" @input="animation.disable_above = $event.target.value" placeholder="0">
                                                <div class="ab-unit-selector">px</div>
                                            </div> 
                                        </div>

                                        <div class="ab-animation-main-controls" v-if="!hasOpenStage">
                                            <div class="ab-option-row ab-name">
                                                <div class="ab-label">Name your animation* <span data-tooltip="Give your animation a name to make it easier to identify later." class="ab-tooltip-indicator ab-up" style="background-image:url(${anibu.anibu_directory}assets/images/tooltip-i.svg)"></span></div>
                                                <input type="text" placeholder="Name this animation" :value="animation.name" @input="animation.name = capitalizeFirstLetter($event.target.value)" class="ab-input ab-name-input">
                                            </div>
                                            <div class="ab-animation-main-controls-grid">
                                                <div :class="animation.deleting ? 'ab-button ab-button-red ab-button-loading ab-inline-button' : 'ab-button ab-button-red ab-inline-button'" @click="deleteAnimation(animation.id)">Delete animation</div>
                                                <div v-if="! animation.scrub" class="ab-button ab-refresh-button ab-button-grey ab-inline-button" @click="refreshAnimations"><img src="${anibu.anibu_directory}assets/images/play.svg"> Preview</div>
                                                <div v-if="animation.scrub" class="ab-button ab-refresh-button ab-button-grey ab-inline-button ab-button-disabled"><img src="${anibu.anibu_directory}assets/images/play.svg"> Scroll page to preview scrub</div>
                                                <div :class="animation.saving ? 'ab-button ab-button-loading ab-inline-button' : 'ab-button ab-inline-button'" @click="saveAnimation">Save</div>
                                            </div>
                                        </div>

                                    </div>
                                    

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const appContainer = jQuery('<div id="ab-app"></div>');
        jQuery('body').append(appContainer);

        let refreshTimeout = null;
        const debouncedRefreshAnimations = function(page_animations, global_animations) {
                jQuery('.ab-animation-triggered').removeClass('ab-animation-triggered');
                renderAbAnimations({ page: page_animations, global: global_animations }, true);
        };
        
        // Helper function to generate a unique ID
        const generateUniqueId = () => Array.from({length: 10}, () => Math.random().toString(36)[2]).join('');

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if(urlParams.get('global') == 'true'){
            tab = 'global';
        }else{
            tab = 'all';
        }

        createApp({
            template: appTemplate,
            data() {
                return {
                    tab: tab,
                    gsap_installed: window.gsap,
                    gsap_url: anibu.gsap_url ? anibu.gsap_url : 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js',
                    gsap_scroll_trigger_installed: window.ScrollTrigger,
                    gsap_scroll_trigger_url: anibu.gsap_scroll_trigger_url ? anibu.gsap_scroll_trigger_url : 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js',
                    cdn_form_submitted: new URLSearchParams(window.location.search).get('cdn_urls_submitted'),
                    builder_closed: false,
                    page_animations: anibu.page_animations,
                    global_animations: anibu.global_animations,
                    anibu: anibu,
                    preset_search: '',
                    preset_panel_activated: false,
                    animation: {},
                    controls: {
                        opacity: {
                            open: false
                        },
                        positioning: {
                            open: false
                        },
                        scale: {
                            open: false
                        },
                        rotation: {
                            open: false
                        },
                        color: {
                            open: false
                        }
                    },
                    presets: {
                        "fade-in": {
                            presetName: "Fade in",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-in-up": {
                            presetName: "Fade in up",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: 100,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-in-left": {
                            presetName: "Fade in left",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "from",
                            positionx: 100,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-in-right": {
                            presetName: "Fade in right",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "from",
                            positionx: -100,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-in-down": {
                            presetName: "Fade in down",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: -100,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-out": {
                            presetName: "Fade out",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-out-up": {
                            presetName: "Fade out up",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: -100,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-out-down": {
                            presetName: "Fade out down",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: 100,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-out-left": {
                            presetName: "Fade out left",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "to",
                            positionx: -100,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "fade-out-right": {
                            presetName: "Fade out right",
                            opacity: "0",
                            duration: 1250,
                            animation_type: "to",
                            positionx: 100,
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-in": {
                            presetName: "Zoom in",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-in-up": {
                            presetName: "Zoom in up",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: '100%',
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-in-down": {
                            presetName: "Zoom in down",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: '-100%',
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-in-left": {
                            presetName: "Zoom in left",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: '100%',
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-in-right": {
                            presetName: "Zoom in right",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: '100%',
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-out": {
                            presetName: "Zoom out",
                            opacity: null,
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-out-up": {
                            presetName: "Zoom out up",
                            opacity: null,
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: "-100%",
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-out-down": {
                            presetName: "Zoom out down",
                            opacity: null,
                            duration: 1250,
                            animation_type: "to",
                            positionx: null,
                            positiony: "100%",
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-out-left": {
                            presetName: "Zoom out left",
                            opacity: null,
                            duration: 1250,
                            animation_type: "to",
                            positionx: "-100%",
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "zoom-out-right": {
                            presetName: "Zoom out right",
                            opacity: null,
                            duration: 1250,
                            animation_type: "to",
                            positionx: "100%",
                            positiony: null,
                            scalex: "0",
                            scaley: "0",
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "move-in-from-left": {
                            presetName: "Move in from left",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: "-100%",
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "move-in-from-right": {
                            presetName: "Move in from right",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: "100%",
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "move-in-from-right": {
                            presetName: "Move in from right",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: "100%",
                            positiony: null,
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "move-in-from-bottom": {
                            presetName: "Move in from bottom",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: "100%",
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        },
                        "move-in-from-top": {
                            presetName: "Move in from top",
                            opacity: null,
                            duration: 1250,
                            animation_type: "from",
                            positionx: null,
                            positiony: "-100%",
                            scalex: null,
                            scaley: null,
                            rotate: null,
                            color: null,
                            backgroundColor: null
                        }
                    }
                }
            },
            components: {
                InlineDropdown,
                InputWithUnit,
                SpectrumColorInput
            },
            methods: {
                setTab(tab) {
                    if(! this.animation.id){
                        this.tab = tab;
                        this.animation.selection = false;
                    }else{
                        var confirmation = confirm('Switching tabs will erase your current settings. Do you want to continue?');
                        if(confirmation){
                            this.tab = tab;

                            if(! this.animation.name){
                                delete this.page_animations[this.animation.id];
                            }
                            
                            this.animation = {};
                        }
                    }
                },
                addSimpleAnimation(type) {

                    if(this.tab === 'page' || this.tab === 'all'){
                        var type = 'page';
                    }else{
                        var type = 'global';
                    }

                this.animation = {
                        type: type,
                        id: generateUniqueId(),
                        trigger_point: 'top',
                        viewport_point: '90%',
                        trigger_select: true,
                        animation_type: 'from',
                        valid_trigger: false,
                        trigger: null,
                        type: type,
                        selection: 'simple'
                    }
                },
                addTimelineAnimation(type) {

                    if(this.tab === 'page' || this.tab === 'all'){
                        var type = 'page';
                    }else{
                        var type = 'global';
                    }

                this.animation = {
                        type: type,
                        id: generateUniqueId(),
                        trigger_point: 'top',
                        viewport_point: 'bottom',
                        scrub_trigger_point: 'center',
                        scrub_viewport_point: 'center',
                        trigger_select: true,
                        valid_trigger: false,
                        trigger: null,
                        stages: [],
                        type: type,
                        selection: 'timeline'
                    }
                },
                addStageToAnimation() {
                    this.animation.stages.push({
                        id: generateUniqueId(), // Unique ID for key and sorting
                        open: true,
                        trigger_child: true,
                        animation_type: 'from'
                    });
                    
                    // Re-initialize sortable after adding an item and rendering
                    this.$nextTick(this.initializeSortable);
                },
                handleElementHover(event) {
                    if(this.animation.trigger_select && ! this.animation.trigger){
                        var width = jQuery(event.target).outerWidth();
                        var height = jQuery(event.target).outerHeight();
                        var left = jQuery(event.target).offset().left;
                        var top = jQuery(event.target).offset().top;

                        if(! jQuery('.ab-hover-indicator').length){
                            jQuery('<div class="ab-hover-indicator"></div>').appendTo('#ab-app');
                        }
                        jQuery('.ab-hover-indicator').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})

                    }

                    if(this.animation.stages && this.animation.stages.some(stage => stage.trigger_select && stage.open)){
                        jQuery('.ab-animation-triggered').removeClass('ab-animation-triggered');

                        const stage = this.animation.stages.find(stage => stage.trigger_select);
                        jQuery('.ab-stage-hover-indicator').remove();
                        if(! stage.trigger_child){

                            let el = event.target;
                            let tag = el.tagName.toLowerCase();
                            let classes = Array.from(el.classList).filter(c => c !== 'ab-animation-triggered').join('.');
                            let selector = tag + (classes ? '.' + classes : '');
                            jQuery(selector).each(function(){
                                var width = jQuery(this).outerWidth();
                                var height = jQuery(this).outerHeight();
                                var left = jQuery(this).offset().left;
                                var top = jQuery(this).offset().top;
                                jQuery('<div class="ab-stage-hover-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                            })
                        }else{
                            let el = event.target;
                            let tag = el.tagName.toLowerCase();
                            let classes = Array.from(el.classList).filter(c => c !== 'ab-animation-triggered').join('.');
                            let selector = jQuery(this.animation.trigger).find(tag + (classes ? '.' + classes : ''));
                            jQuery(selector).each(function(){
                                var width = jQuery(this).outerWidth();
                                var height = jQuery(this).outerHeight();
                                var left = jQuery(this).offset().left;
                                var top = jQuery(this).offset().top;
                                jQuery('<div class="ab-stage-hover-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                            })
                        }
                    }
                },
                handleMouseOut(event) {
                    jQuery('.ab-hover-indicator').remove(); 
                    jQuery('.ab-stage-hover-indicator').remove(); 
                },
                handleElementSelect(event) {
                        event.preventDefault();
                        if (this.animation.trigger_select && !this.animation.trigger) {
                            let el = event.target;
                            let tag = el.tagName.toLowerCase();
                            let classes = Array.from(el.classList).filter(c => c !== 'ab-animation-triggered').join('.');
                            let selector = tag + (classes ? '.' + classes : '');
                            this.animation.trigger = selector;
                            return;
                        }

                        if (this.animation.stages && this.animation.stages.some(stage => stage.trigger_select && stage.open)) {

                            if(this.animation.stages){
                                this.animation.stages.forEach(stage => {
                                    if(stage.trigger_select && stage.open){
                                        let el = event.target;
                                        let tag = el.tagName.toLowerCase();
                                        let classes = Array.from(el.classList).filter(c => c !== 'ab-animation-triggered').join('.');
                                        let selector = tag + (classes ? '.' + classes : '');

                                        stage.trigger = selector;
                                        stage.trigger_select = false; 
                                        return;
                                    }
                                })
                            }

                            jQuery('.ab-animation-triggered').removeClass('ab-animation-triggered');
                        }

                        var $targetLink = jQuery(event.target).closest('a'); // find the closest <a> element
                        if ($targetLink.length) {
                            var href = $targetLink.attr('href');
                            if (href) {
                                var separator = href.includes('?') ? '&' : '?';
                                var link = href + separator + 'animation_builder=true';
                                location.href = link;
                            }
                        }

                },
                validateTriggers() {

                    //New
                    jQuery('.ab-hover-indicator').remove(); 
                    jQuery('.ab-select-indicator').remove(); 
                    jQuery('.ab-stage-select-indicator').remove(); 
                    jQuery('.ab-stage-hover-indicator').remove(); 
                    jQuery('.ab-builder-preview').find(this.animation.trigger).each(function(){
                        var width = jQuery(this).outerWidth();
                        var height = jQuery(this).outerHeight();
                        var left = jQuery(this).offset().left;
                        var top = jQuery(this).offset().top;
                        jQuery('<div class="ab-select-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                    })
                    
                    if(this.animation.stages){
                        this.animation.stages.forEach(stage => {
                            if(stage.open && stage.animate_trigger){
                                jQuery(this.animation.trigger).each(function(){
                                    var width = jQuery(this).outerWidth();
                                    var height = jQuery(this).outerHeight();
                                    var left = jQuery(this).offset().left;
                                    var top = jQuery(this).offset().top;
                                    jQuery('<div class="ab-stage-select-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                                })

                            }else if(stage.open && this.animation.valid_trigger && ! stage.trigger_child){
                                
                                jQuery(stage.trigger).each(function(){
                                    var width = jQuery(this).outerWidth();
                                    var height = jQuery(this).outerHeight();
                                    var left = jQuery(this).offset().left;
                                    var top = jQuery(this).offset().top;
                                    jQuery('<div class="ab-stage-select-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                                })

                            }else if(stage.open && this.animation.valid_trigger && stage.trigger_child){
                                
                                jQuery(this.animation.trigger).find(stage.trigger).each(function(){
                                    var width = jQuery(this).outerWidth();
                                    var height = jQuery(this).outerHeight();
                                    var left = jQuery(this).offset().left;
                                    var top = jQuery(this).offset().top;
                                    jQuery('<div class="ab-stage-select-indicator"></div>').appendTo('#ab-app').css({width: width + 'px',height: height + 'px',left: left + 'px',top: top + 'px'})
                                })

                            }
                        })
                    }

                    if(jQuery('.ab-builder-preview').find(this.animation.trigger).length || this.animation.trigger && this.animation.type === 'global'){
                        this.animation.valid_trigger = true;
                    }else{
                        this.animation.valid_trigger = false;
                    }
                    
                    if(this.animation.stages){
                        this.animation.stages.forEach(stage => {
                            const preview = document.querySelector('.ab-builder-preview');

                            if ((preview && preview.querySelector(stage.trigger)) || (stage.trigger && this.animation.type === 'global') || stage.animate_trigger) {
                                if(stage.animate_trigger){
                                    stage.valid_trigger = true;
                                }else if (stage.trigger_child) {
                                    const parentTrigger = this.animation.trigger;
                                    if (jQuery(parentTrigger).find(stage.trigger).length) {
                                        stage.valid_trigger = true;
                                    } else {
                                        stage.valid_trigger = false;
                                    }
                                } else {
                                    stage.valid_trigger = true;
                                }
                            } else {
                                stage.valid_trigger = false;
                            }
                        });
                    }
                },
                removeStage(stage) {
                    var confirmation = confirm('Are you sure you want to remove this stage? It will not be recoverable.');
                    if(confirmation){
                        this.animation.stages.splice(this.animation.stages.indexOf(stage), 1);
                    }
                },
                saveStage(stage) {
                    if(!stage.valid_trigger){
                        alert('Please select an element to animate to save this stage in your timeline.');
                    }else if(! stage.positionx && ! stage.positiony && ! stage.opacity && ! stage.scalex && ! stage.scaley && ! stage.rotate && ! stage.color && ! stage.backgroundColor){
                        alert('Please configure at least one animation property to save this stage in your timeline.');
                    }else{
                        stage.open = false;
                    }
                },
                saveAnimation(){
                    if(!this.animation.name){
                        jQuery('.ab-animation-main-controls .ab-name').removeClass('ab-require-notice');
                        setTimeout(() => {
                            jQuery('.ab-animation-main-controls .ab-name').addClass('ab-require-notice');  
                        }, 100);
                        alert('Please name your animation before saving.');
                        return;
                    }
                    this.animation.saving = true;
                    jQuery.ajax({
                        url: anibu.ajax_endpoint,
                        method: 'POST',
                        dataType: 'json',
                        data: {
                            action: 'anibu_save_animation',
                            animation: this.animation,
                            page: anibu.page_id,
                            nonce: anibu.nonce
                        },
                        success: (data) => {
                            this.page_animations = data.page;
                            this.global_animations = data.global;

                            this.tab = 'all';
                            
                            this.animation = {};
                            debouncedRefreshAnimations(this.page_animations, this.global_animations);
                        }
                    })
                },
                editAnimation(animation){
                    this.animation = animation;
                    // Re-initialize sortable after editing an animation to apply sorting to its stages
                    this.$nextTick(this.initializeSortable); 
                },
                deleteAnimation(animation_id){
                    
                    var confirmation = confirm('Are you sure you want to delete this animation? It will not be recoverable.');
                    if(confirmation){

                        this.animation.deleting = true;

                        jQuery.ajax({
                            url: anibu.ajax_endpoint,
                            method: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'anibu_delete_animation',
                                animation_id: animation_id,
                                page: anibu.page_id,
                                nonce: anibu.nonce
                            },
                            success: (data) => {
                                this.page_animations = data.page;
                                this.global_animations = data.global;
                                this.$nextTick(() => {
                                    this.animation = {}; 
                                    debouncedRefreshAnimations(this.page_animations, this.global_animations);
                                });
                            }
                        })
                    }
                },
                closeConfiguration(){
                    if(! this.animation.valid_trigger){
                        delete this.page_animations[this.animation.id];
                        delete this.global_animations[this.animation.id];
                        this.animation = {};
                    }else if(! this.animation.name){
                        this.deleteAnimation(this.animation.id);
                    }else{
                        this.animation = {};
                    }
                },
                reorderStages(fromIndex, toIndex) {
                    if (fromIndex === toIndex) return;

                    const stages = this.animation.stages;
                    const [movedStage] = stages.splice(fromIndex, 1);
                    stages.splice(toIndex, 0, movedStage);

                    this.animation.stages = [...stages];
                },
                initializeSortable() {
                    const stagesListEl = this.$refs.stagesList;
                    if (stagesListEl && this.animation.stages && this.animation.stages.length > 0) {
                        if (jQuery(stagesListEl).data('uiSortable')) {
                            jQuery(stagesListEl).sortable('destroy');
                        }
                        
                        jQuery(stagesListEl).sortable({
                            items: '.ab-stage',
                            handle: '.ab-stage-handle',
                            axis: 'y',
                            containment: 'parent',
                            tolerance: 'pointer',
                            stop: (event, ui) => {
                                const fromIndex = parseInt(ui.item.data('old-index'), 10);
                                const toIndex = jQuery(stagesListEl).children('.ab-stage').index(ui.item);

                                if (fromIndex !== toIndex) {
                                    this.reorderStages(fromIndex, toIndex);
                                }
                                this.$nextTick(this.initializeSortable);
                            },
                            start: (event, ui) => {
                                ui.item.data('old-index', jQuery(stagesListEl).children('.ab-stage').index(ui.item));
                            }
                        });
                    } else if (stagesListEl && jQuery(stagesListEl).data('uiSortable')) {
                        jQuery(stagesListEl).sortable('destroy');
                    }
                },
                capitalizeFirstLetter(str) {
                    if (!str) return '';
                    return str.charAt(0).toUpperCase() + str.slice(1);
                },
                refreshAnimations(){
                   debouncedRefreshAnimations(this.page_animations, this.global_animations);
                },
                formatDate(timestamp){
                    if (!timestamp) return '';
                    const now = new Date();
                    const date = new Date(timestamp * 1000); // convert seconds → milliseconds
                    const seconds = Math.floor((now - date) / 1000);

                    if (seconds < 60) {
                        return 'just now';
                    }

                    const intervals = [
                        { label: 'year', seconds: 31536000 },
                        { label: 'month', seconds: 2592000 },
                        { label: 'day', seconds: 86400 },
                        { label: 'hour', seconds: 3600 },
                        { label: 'minute', seconds: 60 },
                    ];

                    for (const interval of intervals) {
                        const count = Math.floor(seconds / interval.seconds);
                        if (count >= 1) {
                        return count + ' ' + interval.label + (count > 1 ? 's' : '') + ' ago';
                        }
                    }
                },
                upgradeToPro(){
                    if(anibu.pro) return;
                    this.animation = {};
                    this.tab = 'global';
                },
                toggleBuilder(){
                    this.builder_closed = !this.builder_closed;
                    this.$nextTick(() => {
                        setTimeout(() => {
                            this.validateTriggers();
                        }, 250);
                    });
                },
                selectPreset(preset){
                    this.$nextTick(() => {
                    setTimeout(() => {
                        this.preset_panel_activated = false;  
                        for (let property in preset) {
                            if (preset.hasOwnProperty(property)) {
                                this.animation[property] = preset[property];
                            }
                        }
                        this.preset_search = '';
                        this.animation.preset_selected = true;
                        this.animation.name = preset.presetName +' '+ this.animation.trigger;
                        
                        for (let control in this.controls) {
                            if (this.controls.hasOwnProperty(control)) {
                                this.controls[control].open = false;
                            }
                        }
                        
                    }, 25);

                    setTimeout(() => {
                        this.refreshAnimations();
                    }, 100);
                    });
                },
                handleDisablePresetPanel(event) {
                    if(this.preset_panel_activated){
                        const area = this.$refs.presetArea;
                        if (area && !area.contains(event.target)) {
                            this.preset_panel_activated = false;
                            this.preset_search = '';
                        }
                    }
                },
                saveLibrarySettings(){
                    const urlParams = new URLSearchParams(window.location.search);
                    const referrer = urlParams.get('referrer'); 
                     jQuery.ajax({
                        url: anibu.ajax_endpoint,
                        method: 'POST',
                        data: {
                            action: 'anibu_save_library_settings',
                            gsap_url: this.gsap_url,
                            gsap_scroll_trigger_url: this.gsap_scroll_trigger_url,
                            nonce: anibu.nonce
                        },
                        success: (data) => {
                            var url = new URL(window.location.href);
                            if (!this.cdn_form_submitted) {
                                url.searchParams.set('cdn_urls_submitted', 'true');
                            }
                            var newUrl = url.toString();
                            if (newUrl === window.location.href) {
                                window.location.reload();
                            } else {
                                window.location.href = newUrl;
                            }
                        }
                    })
                }
            },
            mounted() {
                this.$nextTick(() => {
                    jQuery(this.$refs.preview).append(originalContent);
                    
                    const preview = this.$refs.preview;
                    if(preview){
                        preview.addEventListener('mouseover', this.handleElementHover);
                        preview.addEventListener('mouseleave', this.handleMouseOut);
                    }
                    if(preview){
                        preview.addEventListener('click', this.handleElementSelect);
                    }

                    this.initializeSortable();

                    jQuery(window).on('resize', () => {
                        setTimeout(() => {
                            this.validateTriggers();
                        }, 250);
                    });
                });

                 document.addEventListener('click', this.handleDisablePresetPanel);
                
            },
            watch: {
                animation: {
                    deep: true,
                    handler(animation) {
                        if(animation.id && !animation.trigger) {
                            this.animation.trigger_select = true;
                        }

                        if(animation.scrub){
                            this.refreshAnimations();
                        }

                        if(animation.name){
                            jQuery('.ab-animation-main-controls .ab-name').removeClass('ab-require-notice');  
                        }

                        if(animation.stages){
                            animation.stages.forEach(stage => {
                                if(!stage.id) {
                                    stage.id = generateUniqueId(); 
                                }
                                if(stage.open){
                                    if( !stage.trigger) {
                                        stage.trigger_select = true;
                                    }
                                }
                            })
                        }
                        
                        if(animation.id){
                            if(this.animation.type == 'global'){
                                delete this.page_animations[this.animation.id];
                                this.global_animations[this.animation.id] = animation;
                            }else{
                                delete this.global_animations[this.animation.id];
                                this.page_animations[this.animation.id] = animation;
                            }
                        }
                        this.validateTriggers();

                        this.$nextTick(this.initializeSortable);
                    }
                }
            },
            computed: {
                hasOpenStage() {
                    if (!this.animation || !this.animation.stages) {
                        return false;
                    }
                    return this.animation.stages.some(stage => stage.open);
                },
                hasOpenStageTriggerSelect() {
                    if (!this.animation || !this.animation.stages) {
                        return false;
                    }
                    return this.animation.stages.some(stage => stage.open && stage.trigger_select);
                },
                filteredPresets() {
                    const results = Object.values(this.presets || {}).filter(preset =>
                        (preset.presetName || '').toLowerCase().includes(this.preset_search.toLowerCase())
                    );

                    if (results.length === 0) {
                        return false;
                    }

                    return results;
                }
            }
        }).mount('#ab-app')
})