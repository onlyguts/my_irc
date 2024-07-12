import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Message from './Message';
import MessageMe from './MessageMe';
import MessageLogs from './MessageLogs';
import { useNavigate } from 'react-router-dom';
import './style.css';
import InputEmoji from 'react-input-emoji';
import { Helmet } from 'react-helmet';

// photo icone
import IconLeave from './asset/leave.png';
import IconDelete from './asset/delete.png';
import IconSend from './asset/send.png';
import IconParametres from './asset/parametres.png'
import IconCreate from './asset/create.png';
// import Alert from '@mui/material/Alert';

const socket = io('http://localhost:4500');

const Chat = () => {
    const [channel, setChannel] = useState('main');
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [userName, setUserName] = useState('');
    const [ListUser, setListUser] = useState([]);
    const [ListChannel, setListChannel] = useState([{ owner: 'admin', channel: 'main' }]);
    const [HistoriqueUsers, setHistoriqueUsers] = useState([]);
    let users = null
    let users_id = 1
    const usersJSON = JSON.parse(localStorage.getItem('user'));

    if (usersJSON) {
        users = usersJSON.username
        users_id = usersJSON.id
        // console.log(users)
        // console.log(users_id)
    }
    const navigate = useNavigate();

    // const names = {
    //     username: "Pierre",
    //     id: "1",
    // }
    // localStorage.setItem("names", JSON.stringify(names));
    // var storedNames = JSON.parse(localStorage.getItem("names")).username;


    // console.log(storedNames)

    // localStorage.removeItem("user");
    // console.log(users)

    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendArray", (arg) => {
            setMessages(arg);
        });
        return () => {
            socket.off('sendArray')
        };
    }, [])

    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendUser", (arg) => {
            setListUser(arg);
            // console.log(arg)
        });
        return () => {
            socket.off('sendUser')
        };
    }, [])


    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendMessageRoom", (arg) => {
            console.log(arg.username)
            socket.emit('sendMessage', { text: arg.username + ' vient de rejoindre le channel ' + arg.channel, username: '[LOGS]', channel: arg.channel });
        });
        return () => {
            socket.off('sendMessageRoom')
        };
    }, [])



    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendRoomsUsers", (arg) => {
            setHistoriqueUsers(arg);
            // console.log(arg)
        });
        return () => {
            socket.off('sendRoomsUsers')
        };
    }, [])

    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendRoomLeave", (arg) => {
            socket.emit('sendMessage', { text: arg.username + ' vient de leave le channel ' + arg.channel, username: '[LOGS]', channel: arg.channel });


        });
        return () => {
            socket.off('sendRoomLeave')
        };
    }, [])

    useEffect(() => {
        // console.log("coucouc in useEfect")
        socket.on("sendChannel", (arg) => {
            setListChannel(arg);
            // console.log(arg)
        });
        return () => {
            socket.off('sendChannel')
        };
    }, [])

    // console.log(ListUser)

    useEffect(() => {
        socket.on('message', (message) => {
            setMessages([...messages, message]);
            // console.log(channel)
        });

        return () => {
            socket.off('message')
        };
    }, [messages, channel])

    function ChangeUserName() {
        const names = {
            username: userName,
            id: HistoriqueUsers.length + 1,
        }

        console.log(names.id)
        localStorage.setItem('user', JSON.stringify(names));
        socket.emit('saveUsers', { id: names.id, username: userName, channel: channel });
        // socket.emit('sendMessage', { text: userName + ' vient de rejoindre le channel ' + channel, username: '[LOGS]', channel: channel });
        socket.emit('sendUsersRooms', { id: names.id, username: userName, channel: channel });
        navigate('/');
    }

    const sendMessage = () => {
        let text = messageText;
        let result = text.indexOf("/");
        if (result === 0) {
            var commandEntier = text;

            if (commandEntier.indexOf("/create") === 0) {
                var commandCreate = "/create";
                var truncateBefore = function (commandEntier, commandCreate) {
                    return commandEntier.slice(commandEntier.indexOf(commandCreate) + commandCreate.length);
                };
                const NewChannel = truncateBefore(commandEntier, commandCreate); // "nom commande"
                socket.emit('addChannel', { owner: userName, channel: NewChannel.trim() });
                socket.emit('sendMessage', { text: userName + ' vient de créer le channel ' + NewChannel.trim(), username: '[LOGS]', channel: NewChannel.trim() });

                setMessageText('');
                setChannel(NewChannel.trim())
                socket.emit('changeUsers', { id: users_id, username: userName, channel: NewChannel.trim() });

                return () => {
                    socket.off('changeUsers')
                };
            }
            else if (commandEntier.indexOf("/delete") === 0) {
                var commandDelete = "/delete";
                var truncateBefore2 = function (commandEntier, commandDelete) {
                    return commandEntier.slice(commandEntier.indexOf(commandDelete) + commandDelete.length);
                };
                const NewChannel = truncateBefore2(commandEntier, commandDelete); // "nom commande"
                console.log("channel delete " + NewChannel.trim())
                for (let i = 0; i < ListChannel.length; i++) {
                    const element = ListChannel[i];

                    if (element.owner === userName && element.channel === NewChannel.trim()) {
                        console.log(element.owner, userName)
                        socket.emit('deleteChannel', { owner: userName, channel: NewChannel.trim() });

                    }
                }
                //    console.log(ListChannel[0].owner)
                //    socket.emit('deleteChannel', { owner: userName, channel: NewChannel });
                setMessageText('');
            }
            else if (commandEntier.indexOf("/join") === 0) {
                var commandJoin = "/join";
                var truncateBefore3 = function (commandEntier, commandJoin) {
                    return commandEntier.slice(commandEntier.indexOf(commandJoin) + commandJoin.length);
                };
                const NewChannel = truncateBefore3(commandEntier, commandJoin); // "nom commande"
                //    socket.emit('deleteChannel', { owner: userName, channel: NewChannel });
                setMessageText('');
                setChannel(NewChannel.trim())
                socket.emit('changeUsers', { id: users_id, username: userName, channel: NewChannel.trim() });


            }
            else if (commandEntier.indexOf("/leave") === 0) {
                var commandleave = "/leave";
                var truncateBefore3 = function (commandEntier, commandleave) {
                    return commandEntier.slice(commandEntier.indexOf(commandleave) + commandleave.length);
                };
                const NewLeave = truncateBefore3(commandEntier, commandleave); // "nom commande"
                console.log(NewLeave)
                socket.emit('deleteRoomUsers', { id: users_id, username: userName, channel: NewLeave.trim() });
                setChannel('main')
                setMessageText('');
            }
            else if (commandEntier.indexOf("/nick") === 0) {
                var commandNick = "/nick";
                var truncateBeforenick = function (commandEntier, commandNick) {
                    return commandEntier.slice(commandEntier.indexOf(commandNick) + commandNick.length);
                };
                const NewNick = truncateBeforenick(commandEntier, commandNick); // "nom commande"
                setMessageText('')
                const names = {
                    username: NewNick,
                    id: users_id,
                }
                socket.emit('changeUsersName', { id: users_id, username: NewNick.trim(), lastname: userName, channel: channel });
                setUserName(NewNick.trim())
                localStorage.setItem('user', JSON.stringify(names));

            }
            else if (commandEntier.indexOf("/list") === 0) {
                var commandList = "/delete";
                var truncateBefore4 = function (commandEntier, commandList) {
                    return commandEntier.slice(commandEntier.indexOf(commandList) + commandList.length);
                };
                const NewChannel = truncateBefore4(commandEntier, commandList); // "nom commande"

                if (NewChannel === '') {
                    socket.emit('sendMessage', { text: 'Liste des Channel : \n ', username: '[Info]', channel: channel });
                    for (let i = 0; i < ListChannel.length; i++) {
                        const element = ListChannel[i];
                        socket.emit('sendMessage', { text: element.channel, username: '[Info]', channel: channel });

                    }
                } else {
                    socket.emit('sendMessage', { text: 'Liste du Channel : \n ', username: '[Info]', channel: channel });
                    for (let i = 0; i < ListChannel.length; i++) {
                        const element = ListChannel[i];
                        if (element.channel === NewChannel) {
                            socket.emit('sendMessage', { text: NewChannel, username: '[Info]', channel: channel });
                        }
                    }
                }
                setMessageText('');
            }
            else if (commandEntier.indexOf("/users") === 0) {
                socket.emit('sendMessage', { text: 'Liste des Utilisateur dans le channel', username: '[Info]', channel: channel });
                for (let i = 0; i < ListUser.length; i++) {
                    const element = ListUser[i];
                    if (element.channel === channel) {
                        // console.log(element)
                        socket.emit('sendMessage', { text: element.username, username: '[Info]', channel: channel });
                    }
                }
                setMessageText('');
            }
            else {
                console.log("console existe pas")
            }
        } else {
            socket.emit('sendMessage', { text: messageText, username: users, channel: channel });
            setMessageText('');
        }
    };

    function handleKeyPress(e) {
        if (e.key === "Enter" && !e.ctrlKey) {
            sendMessage();
        } else if (e.key === "Enter" && e.ctrlKey) {
            console.log("non")
            setMessageText(messageText + "\n");
        }
    }

    function handleKeyPress1(e) {
        if (e.key === "Enter") {
            ChangeUserName();
        }
    }

    const sendDeco = () => {
        localStorage.removeItem("user");
        navigate('/');
    };
    const PromptParam = () => {
        const action = window.prompt('Tapez votre nouveau pseudo ou "2" pour se déconnecter:');
        if (action && action !== '2') {
            const newNick = action;
            if (newNick && newNick !== userName) {
                setUserName(newNick);
                const names = {
                    username: newNick,
                    id: users_id,
                };
                socket.emit('changeUsersName', { id: users_id, username: newNick, lastname: userName, channel: channel });
                localStorage.setItem('user', JSON.stringify(names));
                alert('Votre pseudo a été changé avec succès!');
            } else if (newNick && newNick === userName) {
                alert("C'est déjà votre pseudo.. Choisissez en un autre.")
            }
        }
        else if (action === '2') {
            const confirmLogout = window.confirm('Êtes-vous sûr de vouloir vous déconnecter?');
            if (confirmLogout) {
                sendDeco();
                alert('Vous vous êtes déconnecté.');
            }
        } else {
            alert('Action non valide.');
        }
    };

    const CreateChannel = () => {
        const NewChannel = window.prompt("Entrez le nom du salon que vous voulez créer :");
        if (NewChannel) {
            socket.emit('addChannel', { owner: userName, channel: NewChannel });
            socket.emit('sendMessage', { text: `${userName} vient de créer le channel ${NewChannel}`, username: '[LOGS]', channel: NewChannel });
            setChannel(NewChannel);
            socket.emit('changeUsers', { id: users_id, username: userName, channel: NewChannel });
            alert(`Le salon ${NewChannel} a été créé avec succès`);
        }
    }

    const DeleteChannel = () => {
        const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le salon ${channel}?`);
        if (confirmDelete) {
            const channelToDelete = ListChannel.find(element => element.owner === userName && element.channel === channel);
            if (channelToDelete) {
                socket.emit('deleteChannel', { owner: userName, channel: channel });
                alert(`Le salon ${channel} a été supprimé avec succès!`);
                setChannel('main');
            }
        }
    }

    const LeaveChannel = () => {
        const confirmLeave = window.confirm(`Voulez-vous vraiment quitter le salon ${channel}?`);
        if (confirmLeave) {
            socket.emit('deleteRoomUsers', { id: users_id, username: userName, channel: channel });
            setChannel('main');
            alert(`Vous avez quitté le salon ${channel}.`);
        }
    }


    function Channel(room) {
        // socket.emit('addChannel', { owner: userName, channel: 'main' });
        setChannel(room)

        for (let i = 0; i < ListUser.length; i++) {

            const element = ListUser[i];

            // console.log(element.username, userName)
            // console.log(element.channel, room)

            if (element.username === userName && element.channel === room) {
                return
            } else if (element.username === userName && element.channel !== room) {
                socket.emit('changeUsers', { id: users_id, username: userName, channel: room });
                // socket.emit('sendMessage', { text: userName + ' vient de rejoindre le channel ' + room, username: '[LOGS]', channel: room });
                return
            }

            // if (element.username === userName && element.channel === room) {
            //     console.log("deja la ")
            //     socket.emit('changeUsers', { username: userName, channel: room });

            //     return
            // } else if (element.username != userName && element.channel === room) {
            //     socket.emit('changeUsers', { username: userName, channel: room });

            //     socket.emit('sendMessage', { text: userName + ' viens de rejoindre le channel ' + room, username: '[LOGS]', channel: room });
            //     return
            // }


        }

        return () => {
            socket.off('changeUsers')
        };
    };

    if (!users) {
        return (
            <div className="login">
                <div className="center-container">
                    <input
                        type="text"
                        placeholder="Ton pseudo"
                        value={userName}
                        onKeyPress={handleKeyPress1}
                        onChange={(e) => setUserName(e.target.value)}
                        className="input-field"
                    />
                    <button onClick={ChangeUserName} className="send-button">
                        Send
                    </button>
                </div>
            </div>
        );
    } else {
        return (
            <>
                <Helmet>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                    <link href="https://fonts.googleapis.com/css2?family=Exo:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
                </Helmet>
                <div className="container">
                    <div className="liste-channel">
                        <div className='texte-channel'>
                            <h1>Channels </h1>
                            <button onClick={CreateChannel}><img src={IconCreate} className='icon' alt='Créer' /></button>
                        </div>
                        {ListChannel.map((room, index) => (
                            <div key={index} className="btn-channel" onClick={() => Channel(room.channel)}>
                                <p> {room.channel}</p>
                            </div>
                        ))}
                    </div>
                    <div className="liste-utilisateur">
                        <h1 className='userTitle'>Utilisateurs</h1>
                        <ul className='userList'>
                            {HistoriqueUsers.map((user, index) => (
                                user.channel === channel
                                    ? (<li key={index} >{user.username}</li>)
                                    : null
                            ))}
                        </ul>
                    </div>
                    <div className="barre">
                        <InputEmoji
                            value={messageText}
                            onChange={setMessageText}
                            cleanOnEnter
                            onEnter={sendMessage}
                            placeholder="Type a message"
                        />
                        <button className="btn-send" onClick={sendMessage}><img src={IconSend} className='icon' alt='Envoyer' /></button>
                    </div>
                    <div className="nom-channel">
                        <div>
                            {ListChannel.map((element, index) => (
                                <div key={index} className="channel-item">
                                    {element.owner === userName && element.channel === channel && (
                                        <div className="btn">
                                            <button onClick={DeleteChannel}><img src={IconDelete} className='icon' alt='Supprimer' /></button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <h1 className={channel === 'main' ? 'titre-centre' : ''}>{channel}</h1>
                        {channel !== 'main' && (
                            <div>
                                <button onClick={LeaveChannel}><img src={IconLeave} className='icon' alt='Quitter' /></button>
                            </div>
                        )}
                    </div>
                    <div className="conversation">
                        {messages.map((message, index) => (
                            message.channel === channel ? (
                                message.username === userName ? (
                                    <MessageMe key={index} username={message.username} text={message.text} />
                                ) : message.username === '[LOGS]' ? (
                                    <MessageLogs key={index} username={message.username} text={message.text} />
                                ) : (
                                    <Message key={index} username={message.username} text={message.text} />
                                )
                            ) : null
                        ))}
                    </div>
                    <div className='parametre'>
                        <button onClick={PromptParam}>
                            <img src={IconParametres} className='icon' alt='Paramètre' />
                        </button>
                    </div>
                </div>
            </>
        );
    }
};

export default Chat;