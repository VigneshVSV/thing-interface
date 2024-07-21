// Internal & 3rd party functional libraries
import {  useState, useRef, useCallback, useContext, createContext } from "react";
import * as React from "react";
import { observer } from "mobx-react-lite";
// Custom functional libraries
// Internal & 3rd party component libraries
import { Box, Button, Stack, Tab, Tabs, Typography, TextField, Divider,
    IconButton, Autocomplete, ButtonGroup, List, ListItem, ListItemButton,
    ListItemText } from "@mui/material";
import SaveTwoToneIcon from '@mui/icons-material/SaveTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import SettingsTwoToneIcon from '@mui/icons-material/SettingsTwoTone';
import SettingsEthernetTwoToneIcon from '@mui/icons-material/SettingsEthernetTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import OpenInBrowserTwoToneIcon from '@mui/icons-material/OpenInBrowserTwoTone';
import CallReceivedTwoToneIcon from '@mui/icons-material/CallReceivedTwoTone';
import CopyAllTwoToneIcon from '@mui/icons-material/CopyAllTwoTone';
import NewWindow from "react-new-window";
// Custom component libraries
import { EventInformation, MethodInformation, PropertyInformation,
    ResourceInformation} from './thing-info'
import { ErrorBackdrop, TabPanel } from "../reuse-components";
import { defaultAppSettings } from "../app-settings";
import { SelectedPropertyWindow } from "./property-client";
import { SelectedMethodWindow } from "./method-client";
import { SelectedEventWindow } from "./events-client";
import { ErrorBoundary, LiveLogViewer, ResponseLogs, UndockableConsole } from "./output-components";
import { ClassDocWindow } from "./doc-viewer";
import { RemoteObjectClientState } from "./state";



export const ThingViewer = observer(() => {

    return (
        <Stack
            id="client-main-vertical-layout"
            sx={{ flexGrow: 3, display : 'flex', pl : 3, pr : 3 }}
        >
            <UndockableInteractionWindow />
            <ErrorBoundary />
            <ResponseLogs />
            <UndockableConsole />
        </Stack>
    )
})



export const Locator = observer(() => {

    const clientState = useContext(ClientContext) as RemoteObjectClientState
    const { showSettings, setShowSettings } = useContext(PageContext) as PageProps

    return (
        <Stack id="thing-locator-layout" direction="row" sx={{ flexGrow : 1, display : 'flex' }}>
            <Box sx={{ display : 'flex', pb : 3 }}>
                {!showSettings ?
                    <IconButton id='show-settings-icon' onClick={() => setShowSettings(true)} sx={{ borderRadius : 0 }}>
                        <SettingsTwoToneIcon />
                    </IconButton> :
                    <IconButton id='show-thing-viewer-icon' onClick={() => setShowSettings(false)} sx={{ borderRadius : 0 }}>
                        <SettingsEthernetTwoToneIcon />
                    </IconButton>
                }
            </Box>
            <LocatorAutocomplete />
            <Box id="thing-loader-buttons-box" sx={{ flexGrow: 0.01, display : 'flex', pb : 3}} >
                <Button
                    id="load-thing-using-url-locator"
                    size="small"
                    onClick={async() => await clientState.fetchRemoteObjectInfo()}
                    sx={{ borderRadius : 0 }}
                >
                    Load
                </Button>
                <Divider orientation="vertical" />
                <IconButton
                    id='save-thing-url'
                    sx={{ borderRadius : 0 }}
                    onClick={() => clientState.editURLsList(clientState.baseURL, 'ADD')}
                >
                    <SaveTwoToneIcon />
                </IconButton>
                <IconButton
                    id="open-resource-json-in-new-tab"
                    onClick={() => window.open(clientState.baseURL + '/resources/portal-app')}
                    sx = {{ borderRadius : 0 }}
                >
                    <OpenInNewTwoToneIcon />
                </IconButton>
                <Divider orientation="vertical"></Divider>
                <Button
                    id="clear-thing-view"
                    size="small"
                    onClick={() => clientState.clearRemoteObjectInfo()}
                    sx = {{ borderRadius : 0 }}
                >
                    Clear
                </Button>
            </Box>
        </Stack>
    )
})

// { clientState.remoteObjectInfo.instance_name?
//     <Box sx={{ flexGrow: 1, display : 'flex', maxWidth : "25%", pb : 4, pt : 1 }}>
//         <StatusBar clientState={clientState} />
//     </Box> : null
// }

const LocatorAutocomplete = observer(() => {

    const clientState = useContext(ClientContext) as RemoteObjectClientState

    // show delete button at given option
    const [autocompleteShowDeleteIcon, setAutocompleteShowDeleteIcon] = useState<string>('')
    const fetchSuccessful = clientState.fetchSuccessful

    return (
        <Autocomplete
            id="thing-locator-autocomplete"
            freeSolo
            disablePortal
            autoComplete
            size="small"
            onChange={(_, name) => {clientState.updateURLprefixes(name as string)}}
            value={clientState.baseURL}
            options={clientState.existingRO_URLs}
            sx={{ flexGrow : 1, display: 'flex'}}
            renderInput={(params) =>
                <TextField
                    label="URL"
                    variant="filled"
                    error={!fetchSuccessful}
                    sx={{ flexGrow: 0.99, display : 'flex', borderRadius : 0 }}
                    onChange={(event) => clientState.updateURLprefixes(event.target.value)}
                    onKeyDown={async (event) => {
                        if (event.key === 'Enter') {
                            await clientState.fetchRemoteObjectInfo()
                        }
                    }}
                    {...params}
                />}
            renderOption={(props, option : any, {}) => (
                <li
                    {...props}
                    onMouseOver={() => setAutocompleteShowDeleteIcon(option)}
                    onMouseLeave={() => setAutocompleteShowDeleteIcon('')}
                >
                    <Typography
                        sx={{
                            display : 'flex', flexGrow : 1,
                            fontWeight : option === autocompleteShowDeleteIcon? 'bold' : null
                        }}
                    >
                        {option}
                    </Typography>
                    {option === autocompleteShowDeleteIcon?
                    <IconButton size="small" onClick={() => clientState.editURLsList(option, 'REMOVE')}>
                        <DeleteForeverIcon fontSize="small" />
                    </IconButton> : null }
                </li>)}
            />
    )
})



export const StatusBar = observer(( { clientState } : { clientState : RemoteObjectClientState }) => {

    const remoteObjectState = clientState.remoteObjectState
    const remoteObjectInfo = clientState.remoteObjectInfo

    return (
        <>
            {remoteObjectInfo.instance_name?
                <Stack sx={{ flexGrow: 1, display : 'flex' }} direction='row'>
                    <ButtonGroup
                        disableElevation
                        variant='contained'
                        color='secondary'
                        size="small"
                    >
                        <Button>
                            Restart
                        </Button>
                        <Button>
                            Kill
                        </Button>
                        <Button>
                            Start
                        </Button>
                    </ButtonGroup>
                    {remoteObjectState?
                        <Box sx ={{ pt : 0.5, pl : 2}}>
                            <Typography variant="button">
                                { "State : " + remoteObjectState}
                            </Typography>
                        </Box> : null }
                </Stack>
            : null}
        </>
    )
})



const thingFields = ['Properties', 'Actions', 'Events', 'Doc']

const UndockableInteractionWindow = observer(() => {

    const clientState = useContext(ClientContext) as RemoteObjectClientState
    const [currentTab, setCurrentTab] = useState<number>(0)
    const [undock, setUndock] = useState<number>(-1)
    const [duplicates, setDuplicates] = useState<number[]>([])
    const undockedTab = useRef<number>(undock)
    const [tabOrientation, _] = useState<"vertical" | "horizontal">("vertical")

    const handleRemoteObjectFieldTabChange = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setCurrentTab(newValue);
    }, [])

    const addDuplicateWindow = useCallback(() => {
        setDuplicates([...duplicates, currentTab])
        // not perfect
        // console.log([...duplicates, currentTab])
    }, [duplicates, currentTab])

    const removeDuplicateWindow = useCallback((index : number) => {
        duplicates.splice(index, 1)
        setDuplicates([...duplicates])
    }, [duplicates])

    const undockWindow = useCallback(() => {
        undockedTab.current = currentTab
        setUndock(currentTab)
    }, [currentTab])

    const dockWindow = useCallback(() => {
        undockedTab.current = -1
        setUndock(-1)
    }, [])

    return(
        <Stack
            direction='row'
            sx={{ flexGrow : 1, display : 'flex' }}
        >
            <Stack>
                {undock >= 0?
                    <IconButton id='undock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={dockWindow}>
                        <CallReceivedTwoToneIcon fontSize="small"/>
                    </IconButton>
                    :
                    <IconButton id='dock-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={undockWindow}>
                        <OpenInBrowserTwoToneIcon fontSize="small"/>
                    </IconButton>
                }
                <IconButton id='copy-icon-button' size="small" sx={{ borderRadius : 0 }} onClick={addDuplicateWindow}>
                    <CopyAllTwoToneIcon fontSize="small"/>
                </IconButton>
            </Stack>
            <Stack sx={{ flexGrow : 1, display : 'flex' }} direction={tabOrientation === 'vertical'? 'row' : 'column'}>
                <Tabs
                    id="thing-fields-tabs"
                    variant="scrollable"
                    value={currentTab}
                    onChange={handleRemoteObjectFieldTabChange}
                    orientation={tabOrientation}
                    sx={{
                        border : tabOrientation == 'vertical' ? 1 : null,
                        borderRight: tabOrientation === 'vertical'? 3 : 1,
                        borderBottom: tabOrientation === 'vertical'? 1 : 3,
                        flexGrow : tabOrientation === 'vertical'? null : 1,
                        borderColor: 'divider'
                    }}
                >
                    {thingFields.map((name : string) =>
                        <Tab
                            key={"thing-fields-tab-" + name}
                            id={"thing-fields-tab-" + name}
                            label={name}
                            sx={{ maxWidth : 150 }}
                            disabled={!clientState.remoteObjectInfo.instance_name}
                        />
                    )}
                </Tabs>
                <Box
                    sx={{
                        resize : 'vertical', height : clientState.remoteObjectInfo.instance_name? 400 : null,
                        overflow : 'auto', flexGrow : 1, border : 1, borderColor : 'divider'
                    }}
                >
                {thingFields.map((name : string, index : number) => {
                        if(index === undock)
                            return(
                                <NewWindow
                                    name={`${thingFields[undockedTab.current]} - ${clientState.remoteObjectInfo.instance_name}`}
                                    title={`${thingFields[undockedTab.current]} - ${clientState.remoteObjectInfo.instance_name}`}
                                    copyStyles={true}
                                >
                                    <Box id='functionalities-box-new-window' sx={{ p : 5 }}>
                                        <Divider id='functionalities-title'>
                                            <Typography variant="button">
                                                {thingFields[undockedTab.current]} - {clientState.remoteObjectInfo.instance_name}
                                            </Typography>
                                        </Divider>
                                        <Functionalities name={thingFields[undockedTab.current]} />
                                        {/* undocked={undockedTab.current >= 0} */}
                                    </Box>
                                </NewWindow>
                            )
                        return (
                            <TabPanel
                                key={"thing-fields-tabpanel-" + name}
                                tree="thing-fields-tab"
                                index={index}
                                value={currentTab}
                            >
                                <Functionalities name={name} />
                                {/* undocked={undockedTab.current === index} */}
                            </TabPanel>
                        )
                })}
                </Box>
                {duplicates.map((tabNum : number, index : number) =>
                    <NewWindow
                        name={`${thingFields[tabNum]} - ${clientState.remoteObjectInfo.instance_name} - no. ${index}`}
                        title={`${thingFields[tabNum]} - ${clientState.remoteObjectInfo.instance_name} - no. ${index}`}
                        copyStyles={true}
                        onUnload={() => removeDuplicateWindow(index)}
                    >
                        <Box id='functionalities-box-new-window-copied' sx={{ p : 5 }}>
                            <Divider>
                                <Typography variant="button">
                                    {thingFields[tabNum]} - {clientState.remoteObjectInfo.instance_name}
                                </Typography>
                            </Divider>
                            <Functionalities name={thingFields[tabNum]} />
                        </Box>
                    </NewWindow>
                )}
            </Stack>
        </Stack>
    )
})



const Functionalities = observer(({ name } : { name : string }) => {

    const clientState = useContext(ClientContext) as RemoteObjectClientState

    switch(name) {

        case 'Doc' : return <ClassDocWindow />

        // case 'Default GUI'   : return  <GUIViewer hasGUI={clientState.remoteObjectInfo.hasGUI}></GUIViewer>

        case 'Database' : return <Typography sx={{p : 2}}>No DB client</Typography>

        case 'Log Viewer' : return <LiveLogViewer clientState={clientState} />

        default : return <InteractionAffordanceWindow name={name as "Properties" | "Actions" | "Events"} />
                   
    }
})



export const InteractionAffordanceWindow = observer(({ name } : { name : "Properties" | "Actions" | "Events" }) => {

    const clientState = useContext(ClientContext) as RemoteObjectClientState

    // interaction affordance object selection number
    const objects = clientState.getObjects(name)
    const [selectedIndex, setSelectedIndex] = useState<Array<string|number>>(['RemoteObject', 0]);
    const handleListItemClick = useCallback((
            _ : React.MouseEvent<HTMLDivElement, MouseEvent>,
            sortKey : string, index: number,
        ) => {
            setSelectedIndex([sortKey, index]);
            // console.log(sortKey, index, objects[sortKey][index])
    }, [setSelectedIndex])

    return (
        <Stack direction='row' sx={{ flexGrow: 1 }} >
            <Box
                id="interaction-affordance-object-selection-list-layout" 
                sx={{ width : "50%", resize : 'horizontal',
                        overflow : 'auto', height : "100%"
                    }}
            >
                <List
                    id="interaction-affordance-objects-list"
                    dense
                    disablePadding
                    sx={{ flexGrow : 1 }}
                >
                    {Object.keys(objects).map((key : string) => {
                        if(objects[key].length === 0)
                            return <div key={key}></div>
                        else
                            return (
                                <div key={key}>
                                    <Divider><Typography variant="button">{key.toUpperCase()}</Typography></Divider>
                                    {objects[key].map((object : ResourceInformation, index : number) => {
                                        return (
                                            <ListItem
                                                key={`interaction-affordance-client-${name}-${object.name}`}
                                                id={`interaction-affordance-${name}-${object.name}`}
                                                alignItems="flex-start"
                                                disablePadding
                                            >
                                                <ListItemButton
                                                    key={`interaction-affordance-${name}-${object.name}-choosing-button`}
                                                    selected={selectedIndex[1] === index && selectedIndex[0] === key}
                                                    onClick={(event) => handleListItemClick(event, key, index)}
                                                >
                                                    <ListItemText
                                                        key={`interaction-affordance-${name}-${object.name}-text-display`}
                                                        primary={
                                                            <Typography
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between'
                                                                }}
                                                            >
                                                                <span>{object.name}</span>
                                                                {object.type?
                                                                <span style={{color : 'rgba(0, 0, 0, 0.5)'}}>
                                                                    {object.type}
                                                                </span> : null}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        )
                                    })}
                                </div>
                        )})}
                </List>
            </Box>
            <Divider orientation="vertical" sx={{ borderWidth : 2 }} />
            <Box sx={{ width : "50%", pl : 2, pr : 1, overflow : 'auto', height : '100%' }}>
                {
                    objects[selectedIndex[0]] ?
                    objects[selectedIndex[0]][selectedIndex[1]] ?
                    <ClientSelect
                        object={objects[selectedIndex[0]][selectedIndex[1]]}
                        name={name}
                    /> : null : null
                }
            </Box>
        </Stack>
    )
})



type ClientSelectProps = {
    object : ResourceInformation
    name : string
}

export const ClientSelect = ({ object, name } : ClientSelectProps) => {
    
    switch(name) {
        case 'Events' : return <SelectedEventWindow event={object as EventInformation} />                
        case 'Actions' : return <SelectedMethodWindow method={object as MethodInformation} />                
        default : return <SelectedPropertyWindow property={object as PropertyInformation} />
    }
}



type PageProps = {
    showSettings : boolean
    setShowSettings : React.Dispatch<React.SetStateAction<boolean>> | Function
}

export const ClientContext = createContext<RemoteObjectClientState | null>(null)
export const PageContext = createContext<any>({
    showSettings : false,
    setShowSettings : () => {}
})

export const Client = () => {

    const [showSettings, setShowSettings] = useState<boolean>(false)
    const clientState = useRef<RemoteObjectClientState>(new RemoteObjectClientState())
    const [pageState, _] = useState({ showSettings, setShowSettings })

    /*
    1. There is a client state which controls the state of the view itself with MobX. The values contained within
    this state are always related to application data, never purely component rendering data.
    The purely component rendering data is left to react own's state management.

    2. purely component rendering data may be also part of contexts

    3. The Thing is loaded into a class
    */

    return (
        <Box
            id='client-layout-box'
            sx={{pt : 3, display : 'flex', flexGrow : 1, pb : 5}}
        >
            <PageContext.Provider value={pageState}>
                <ClientContext.Provider value={clientState.current}>
                {!showSettings ?
                    <Stack id="thing-viewer-page-layout" sx={{ flexGrow: 1, display: 'flex'}}>
                        <Locator />
                        <ThingViewer />
                    </Stack>
                    :
                    <ErrorBackdrop
                        message="settings panel for unsafe client not implement yet"
                        goBack={() => setShowSettings(false)}
                    />
                }
                </ClientContext.Provider>
            </PageContext.Provider>
        </Box>
    )
}

