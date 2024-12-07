import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Send, Paperclip, CircleArrowLeft, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '@/services/user.service';
import { SocketService, chatService } from '@/services/chat.service';
import { ChatResponse, userResponseType } from '@/lib/types';
import tokenService from '@/services/token.service';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(''); // New search term state
  const messageEndRef = useRef<HTMLDivElement | null>(null); // Use useRef to track the message container
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [otherUserID, setOtherUserID] = useState<number>();
  const [isNewMessage, setIsNewMessage] = useState(false); // Track if it's a new message
  const [showScrollCursor, setShowScrollCursor] = useState(false); // State for showing cursor

  const userId = tokenService.getUserId();
  // console.log(userId);

  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatResponse[]>([]); // Store messages here
  const [users_, setUsers_] = useState<userResponseType[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: number]: number }>({});

  // const memoizedChatMessages = useMemo(() => chatMessages, [chatMessages]);

  // console.log(`CHAT MESSAGES ${chatMessages}`);

  const [selectedUser, setSelectedUser] = useState<userResponseType | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  console.log(isSocketConnected);
  const { useFetchAllUsers } = UserService();
  const { useFetchAllChatBetweenUsers } = chatService();

  const { data: usersChatData, refetch } = useFetchAllChatBetweenUsers(
    otherUserID !== undefined ? otherUserID : 0,
  );

  const { data: usersData, refetch: usersRefetch } = useFetchAllUsers({ username: searchTerm });
  const users = usersData?.data || [];

  // console.log(`Users Chat ${usersChatData}`);
  // console.log(usersData);
  // console.log(users);

  useEffect(() => {
    if (usersData?.data) {
      const sortedUsers = [...usersData.data].sort((a, b) => {
        const aLastMessage = chatMessages.find(
          (msg) => msg.sender.id === a.id || msg.recipient.id === a.id,
        );
        const bLastMessage = chatMessages.find(
          (msg) => msg.sender.id === b.id || msg.recipient.id === b.id,
        );
        //@ts-ignore
        return (bLastMessage?.sentAt || 0) - (aLastMessage?.sentAt || 0);
      });
      setUsers_(sortedUsers);
    }
  }, [usersData, chatMessages]);

  useEffect(() => {
    if (searchTerm.trim()) {
      console.log('Triggering search API with term:', searchTerm); // Debug log
      usersRefetch(); // Call API on search term change
    } else {
      // Fetch without filtering when search term is empty
      usersRefetch();
    }
  }, [searchTerm, usersRefetch]);

  useEffect(() => {
    console.log('useEffect 1');
    debugger;
    const socketService = SocketService.getInstance();
    // socketService.connect();
    const initializeSocket = () => {
      const token = tokenService.getLocalAccessToken(); // Ensure the latest token is fetched
      if (token && !socketService.isConnected()) {
        socketService.connect();
      }
    };

    initializeSocket();

    // if (!socketService.isConnected()) {
    //   socketService.connect();
    // }

    const handleConnection = () => setIsSocketConnected(true);
    const handleDisconnection = () => setIsSocketConnected(false);

    const socket = socketService.getSocket();

    socket?.on('connect', handleConnection);
    socket?.on('disconnect', handleDisconnection);

    socket?.on('messageSent', (newMessage: ChatResponse) => {
      console.log('messageSent', newMessage);

      // if (
      //   (newMessage.sender.id.toString() === userId && newMessage.recipient.id === otherUserID) ||
      //   (newMessage.sender.id === otherUserID && newMessage.recipient.id.toString() === userId)
      // ) {
      if (newMessage) {
        console.log('setting Chat messages in message Sent');
        setChatMessages((prevMessages) => [...prevMessages, newMessage]);
        if (Number(newMessage.sender.id) !== Number(userId)) {
          setUnreadCounts((prev) => ({
            ...prev,
            [newMessage.sender.id]: (prev[newMessage.sender.id] || 0) + 1,
          }));
        }
      }
    });

    return () => {
      socket?.off('connect', handleConnection);
      socket?.off('disconnect', handleDisconnection);
      socket?.off('messageSent'); // Cleanup message listener
      socketService.disconnect();
    };
  }, []);

  // const selectedUserMemoized = useMemo(() => {
  //   if (otherUserID) {
  //     return users.find((user) => user.id === otherUserID) || null;
  //   }
  //   return null;
  // }, [otherUserID, users]);

  // useEffect(() => {
  //   if (selectedUserMemoized) {
  //     setSelectedUser(selectedUserMemoized); // Only set selected user if different
  //     refetch(); // Fetch chat history only when the selected user changes
  //   }
  // }, [selectedUserMemoized, refetch]);

  useEffect(() => {
    console.log('Calling use effect 2');

    if (otherUserID) {
      const user = users_.find((user) => user.id === otherUserID);
      setSelectedUser(user || null); // Update selected user details
      refetch(); // refetching the history only when user is selected
      setUnreadCounts((prev) => ({ ...prev, [otherUserID]: 0 }));
    }
  }, [otherUserID]);

  useEffect(() => {
    if (Array.isArray(usersChatData)) {
      setChatMessages(usersChatData); // Initialize messages with fetched data
    }
  }, [usersChatData]);

  useEffect(() => {
    // console.log('Calling use effect 3');
    if (isNewMessage) {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsNewMessage(false); // Reset new message flag
    } else {
      messageEndRef.current?.scrollIntoView({ behavior: 'instant' });
    }
  }, [chatMessages]);

  // const handleInputChange = useCallback((e: any) => setMessage(e.target.value), []);

  // const throttledSetMessage = useRef(
  //   throttle((value) => {
  //     setMessage(value); // Update message state
  //   }, 0), // Adjust delay as needed
  // ).current;

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollContainer) {
        // scrollContainer.scrollTop = scrollContainer.scrollHeight;
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setShowScrollCursor(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    console.log('Search term:', e.target.value); // Log the search term
  };  

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      );
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 80;
        setShowScrollCursor(!isScrolledToBottom);
      }
    }
  }, []);
  
  // Scroll event handler
  // const handleScroll = useCallback(() => {
  //   const scrollArea = document.querySelector('.scroll-area-selector'); // Adjust selector
  //   if (scrollArea) {
  //     const { scrollTop, scrollHeight, clientHeight } = scrollArea;
  //     const isScrolledToBottom = scrollTop + clientHeight >= scrollHeight - 5; // Allow 5px margin

  //     // Show cursor if not at the bottom
  //     if (!isScrolledToBottom) {
  //       setShowScrollCursor(true);
  //     } else {
  //       setShowScrollCursor(false);
  //     }
  //   }
  // }, []);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]',
    );
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   throttledSetMessage(value); // Use throttled function
  // };

  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    debugger;
    e.preventDefault();
    const socketService = SocketService.getInstance();

    if (!socketService.isConnected() || !otherUserID) {
      socketService.connect();
      console.error('Socket is not connected or no user is selected.');
      toast({
        variant: 'destructive',
        title: 'No user selected',
        description: 'Kindly select a user to chat',
      });
      return;
    }

    if (message.trim() && otherUserID) {
      const socketService = SocketService.getInstance();

      // const newMessage = {
      //   sentAt: new Date(),
      //   message,
      //   recipientId: otherUserID,
      //   sender: {
      //     id: userId,
      //   },
      // };

      // Optimistically update local state
      //@ts-ignore
      // setChatMessages((prevMessages) => [...prevMessages, newMessage]);
      socketService.sendMessage(otherUserID, message);
      setMessage('');
      setIsNewMessage(true); // New message received
    }
  };

  // useEffect(() => {
  //   if (otherUserID && isSocketConnected) {
  //     console.log('Calling use effect 4');
  //     refetch(); // Fetch messages only on user change when socket is connected
  //   }
  // }, [otherUserID, refetch, isSocketConnected]);

  return (
    <div className="flex h-screen bg-gray-100 ">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b flex">
          <button
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="text-green-700 hover:underline"
          >
            <div className="flex">
              <CircleArrowLeft className="mr-5 color-black" />
            </div>
          </button>
          <h1 className="text-xl font-bold">Chats</h1>
        </div>
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              className="pl-9 h-9"
              value={searchTerm} // Controlled input
              onChange={handleSearchChange} // Update search term on change
            />
          </div>
        </div>
        {/* <Tabs defaultValue="all" className="flex-1 flex flex-col"> */}
        <Tabs defaultValue="all" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="all">All</TabsTrigger>
            {/* <TabsTrigger value="groups">Groups</TabsTrigger> */}
          </TabsList>
          <ScrollArea className="h-full">
            <TabsContent value="all" className="flex-1 ">
              {users
                .filter((user) => Number(user.id) !== Number(userId))
                .map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      debugger;
                      setOtherUserID(user?.id);
                    }} // Set selected user ID to fetch chat
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {/* {conversation.type === 'individual' && ( */}
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          user.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h2 className="font-semibold truncate">{user.fullName}</h2>
                        {/* <span className="text-xs text-gray-500">{user.time}</span> */}
                      </div>
                      {/* <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p> */}
                    </div>
                  </div>
                ))}
              {/* </ScrollArea> */}
            </TabsContent>
            {/* <ScrollArea className="flex-1"> */}
            <TabsContent value="group" className="m-0">
              {/* {conversations
                .filter((c) => c.type === 'group')
                .map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h2 className="font-semibold truncate">{conversation.name}</h2>
                        <span className="text-xs text-gray-500">{conversation.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                ))} */}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-white p-3 flex items-center justify-between border-b">
          <div className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={selectedUser?.profileImage || '/placeholder.svg'}
                alt={selectedUser?.fullName}
              />
              <AvatarFallback>
                {selectedUser ? selectedUser.fullName.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <h2 className="font-semibold">
                {selectedUser ? selectedUser.fullName : 'Select a user'}
              </h2>
              <p className="text-xs text-green-500">
                {selectedUser?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          {/* <div className="flex space-x-1">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div> */}
        </div>
        {/* Messages */}

        <ScrollArea
          className="flex-1 p-4 scroll-area-selector h-80 overflow-auto "
          ref={scrollAreaRef}
        >
          {chatMessages.length > 0 ? (
            chatMessages.map((msg) => (
              <>
                {/* {console.log(
                  'Message Sender ID:',
                  msg.sender.id,
                  'Other User ID:',
                  otherUserID,
                  'Message ID:',
                  msg.id,
                  'Type of Sender ID:',
                  typeof msg.sender.id,
                  'Type of User ID:',
                  typeof otherUserID,
                )} */}
                {/* {console.log(`Chat Messages In Focus ${JSON.stringify(chatMessages)}`)} */}
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender.id.toString() === userId ? 'justify-end' : 'justify-start'
                  } mb-4`}
                >
                  <div
                    className={`max-w-[60%] break-words overflow-wrap ${
                      msg.sender.id.toString() === userId
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    } rounded-lg p-2`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {new Date(msg.sentAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              </>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
          <div ref={messageEndRef} />
        </ScrollArea>
        {showScrollCursor && (
          <Button
            variant="outline"
            size="lg"
            className="absolute bottom-20 left-2/3 transform -translate-x-1/2 rounded-full"
            onClick={scrollToBottom}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}

        {/* Message Input */}
        <div className="bg-white p-3 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              // onChange={handleInputChange}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            {/* <Button type="button" variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button> */}
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
        {/* {showScrollCursor && (
          <div className="fixed bottom-16 right-4 cursor-pointer" onClick={scrollToBottom}>
            <ArrowDown className="h-6 w-6 text-gray-600" />
          </div>
        )} */}
      </div>
    </div>
  );
}
