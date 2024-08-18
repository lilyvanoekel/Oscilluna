

/*
    This simple web component just manually creates a set of plain sliders for the
    known parameters, and uses some listeners to connect them to the patch.
*/
class Four_View extends HTMLElement
{
    constructor (patchConnection)
    {
        super();
        this.patchConnection = patchConnection;
        this.classList = "main-view-element";
        this.innerHTML = this.getHTML();
    }

    connectedCallback()
    {
        // When the HTMLElement is shown, this is a good place to connect
        // any listeners you need to the PatchConnection object..

        // First, find our frequency slider:
        const freqSlider = this.querySelector ("#frequency");

        // When the slider is moved, this will cause the new value to be sent to the patch:
        freqSlider.oninput = () => this.patchConnection.sendEventOrValue (freqSlider.id, freqSlider.value);

        // Create a listener for the frequency endpoint, so that when it changes, we update our slider..
        this.freqListener = value => freqSlider.value = value;
        this.patchConnection.addParameterListener (freqSlider.id, this.freqListener);

        // Now request an initial update, to get our slider to show the correct starting value:
        this.patchConnection.requestParameterValue (freqSlider.id);
    }

    disconnectedCallback()
    {
        // When our element is removed, this is a good place to remove
        // any listeners that you may have added to the PatchConnection object.
        this.patchConnection.removeParameterListener ("frequency", this.freqListener);
    }

    getHTML()
    {
        return `
        <style>
            .main-view-element {
                background: #bcb;
                display: block;
                width: 100%;
                height: 100%;
                padding: 10px;
                overflow: auto;
            }

            .param {
                display: inline-block;
                margin: 10px;
                width: 300px;
            }
        </style>

        <div id="controls">
          <p>Your GUI goes here!</p>
          <input type="range" class="param" id="frequency" min="5" max="1000">Frequency</input>
        </div>`;
    }
}

window.customElements.define ("four-view", Four_View);

/* This is the function that a host (the command line patch player, or a Cmajor plugin
   loader, or our VScode extension, etc) will call in order to create a view for your patch.

   Ultimately, a DOM element must be returned to the caller for it to append to its document.
   However, this function can be `async` if you need to perform asyncronous tasks, such as
   fetching remote resources for use in the view, before completing.
*/
export default function createPatchView (patchConnection)
{
    return new Four_View (patchConnection);
}
