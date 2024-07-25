// Internal & 3rd party functional libraries
import { useCallback, useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Button, Stack, ButtonGroup, Link } from "@mui/material"
// Custom component libraries 
import { EventInformation } from './state'
import { Thing } from "./state";
import { PageContext, PageProps, ThingManager } from "./view";
import { ObjectInspector } from "react-inspector";



type EventSelectWindowProps =  { 
    event : EventInformation
}

export const SelectedEventWindow = observer(( { event } : EventSelectWindowProps) => {

    const thing = useContext(ThingManager) as Thing
    const { settings } = useContext(PageContext) as PageProps

    const [eventURL, setEventURL] = useState<string>(event.forms[0].href)
    const [clientChoice, setClientChoice] = useState<string>("node-wot")

    useEffect(() => {
        setEventURL(event.forms[0].href)
        return () => stopEvent()
    }, [event.forms[0].href])
   
    const streamEvent = useCallback(() => {
        if (clientChoice === "node-wot") {
            thing.client.subscribeEvent(event.name, async (data : any) => {
                data.ignoreValidation = true
                const value = await data.value()
                if(settings.console.stringifyOutput)    
                    console.log(value)            
                else 
                    console.log(JSON.parse(value))
            }).then((subscription : any) => {
                thing.addEventSource(event.name, subscription) 
                console.debug("subscribed to intensity measurement event")
            })
        } else {
            let source = new EventSource(eventURL)
            source.onmessage = (event : MessageEvent) => {
                if(settings.console.stringifyOutput)    
                    console.log(event.data)
                else 
                    console.log(JSON.parse(event.data))
            } 
            source.onopen = (event) => {
                console.log(`subscribed to event source at ${eventURL}`)
            } 
            source.onerror = (error) => {
                console.log(error)
            }
            thing.addEventSource(eventURL, source)
        }
    }, [thing, eventURL, settings])

    const stopEvent = () => {
        if (clientChoice === "node-wot") {
            let eventSrc = thing.eventSources[event.name]
            if(eventSrc) {
                eventSrc.unsubscribe()
                console.log(`unsubscribed from event ${event.name}`)
                thing.removeEventSource(event.name)
            }
        }
        else {
            let eventSrc = thing.eventSources[eventURL]
            if(eventSrc) {
                eventSrc.close()
                console.log(`closing event source ${eventURL}`)
                thing.removeEventSource(eventURL)
            }
        }
    }

    return(
        <Stack>
            <Link 
                // @ts-ignore
                onClick={() => window.open(eventURL)} 
                sx={{ display : 'flex', alignItems : "center", cursor:'pointer',  pl : 2, pt : 1, fontSize : 18,
                    color : "#0000EE" }}
                underline="hover"
                variant="caption"
            >
                {eventURL}
            </Link> 
            
            <Stack direction = "row" sx={{ flexGrow: 1, display : 'flex', pl : 1, pt : 1 }}>
                <ButtonGroup 
                    variant="contained"
                    sx = {{ pr : 2 }}
                    disableElevation
                    color="secondary"
                >
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={streamEvent}
                        disabled={thing.eventSources[eventURL] || thing.eventSources[event.name] ? true : false}
                    >
                        Stream
                    </Button>
                    <Button 
                        sx={{ flexGrow: 0.05, display : 'flex'}} 
                        onClick={stopEvent}
                        disabled={thing.eventSources[eventURL] || thing.eventSources[event.name] ? false : true}
                    >
                        Stop
                    </Button>
                </ButtonGroup>
            </Stack>
            <ObjectInspector data={thing.td["events"][event.name]} expandLevel={3} />
        </Stack>
    )
})



