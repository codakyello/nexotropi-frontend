
// // app/negotiations/live/[id]/page.tsx
// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Send, Pause, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';

// // Types
// interface Message {
//   id: string;
//   type: 'ai' | 'counterparty' | 'system' | 'alert';
//   content: string;
//   timestamp: string;
//   metadata?: {
//     price?: number;
//     quantity?: number;
//     paymentTerms?: string;
//   };
// }

// interface NegotiationState {
//   id: string;
//   title: string;
//   counterparty: string;
//   status: 'active' | 'paused' | 'completed' | 'rejected';
//   aiAgentEnabled: boolean;
//   currentOffer: {
//     price: number;
//     quantity: number;
//     paymentTerms: string;
//   } | null;
//   budgetConstraints: {
//     minPrice: number;
//     maxPrice: number;
//     targetQuantity: number;
//   };
// }

// export default function LiveNegotiationPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [showPauseModal, setShowPauseModal] = useState(false);
//   const [showAcceptModal, setShowAcceptModal] = useState(false);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const wsRef = useRef<WebSocket | null>(null);

//   // WebSocket Connection
//   useEffect(() => {
//     const negotiationId = params.id as string;
    
//     // Initialize WebSocket connection
//     const connectWebSocket = () => {
//       const ws = new WebSocket(
//         `${process.env.NEXT_PUBLIC_WS_URL}/negotiations/${negotiationId}`
//       );

//       ws.onopen = () => {
//         console.log('WebSocket connected');
//         setIsConnected(true);
        
//         // Send authentication token
//         ws.send(JSON.stringify({
//           type: 'auth',
//           token: localStorage.getItem('auth_token')
//         }));
//       };

//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         handleWebSocketMessage(data);
//       };

//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setIsConnected(false);
//       };

//       ws.onclose = () => {
//         console.log('WebSocket disconnected');
//         setIsConnected(false);
        
//         // Reconnect after 3 seconds
//         setTimeout(() => {
//           if (wsRef.current?.readyState === WebSocket.CLOSED) {
//             connectWebSocket();
//           }
//         }, 3000);
//       };

//       wsRef.current = ws;
//     };

//     connectWebSocket();

//     // Fetch initial negotiation data
//     fetchNegotiationData(negotiationId);

//     // Cleanup on unmount
//     return () => {
//       if (wsRef.current) {
//         wsRef.current.close();
//       }
//     };
//   }, [params.id]);

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     if (scrollAreaRef.current) {
//       scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
//     }
//   }, [messages]);

//   const fetchNegotiationData = async (negotiationId: string) => {
//     try {
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/negotiations/${negotiationId}`,
//         {
//           headers: {
//             'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
//           }
//         }
//       );
//       const data = await response.json();
//       setNegotiation(data);
//       setMessages(data.messages || []);
//     } catch (error) {
//       console.error('Failed to fetch negotiation data:', error);
//     }
//   };

//   const handleWebSocketMessage = (data: any) => {
//     switch (data.type) {
//       case 'message':
//         setMessages(prev => [...prev, data.message]);
//         break;
      
//       case 'offer':
//         setMessages(prev => [...prev, {
//           id: data.id,
//           type: 'counterparty',
//           content: data.content,
//           timestamp: data.timestamp,
//           metadata: data.offer
//         }]);
//         if (negotiation) {
//           setNegotiation({
//             ...negotiation,
//             currentOffer: data.offer
//           });
//         }
//         break;
      
//       case 'alert':
//         setMessages(prev => [...prev, {
//           id: data.id,
//           type: 'alert',
//           content: data.content,
//           timestamp: data.timestamp
//         }]);
//         break;
      
//       case 'status_update':
//         if (negotiation) {
//           setNegotiation({
//             ...negotiation,
//             status: data.status
//           });
//         }
//         break;
      
//       case 'ai_response':
//         setMessages(prev => [...prev, {
//           id: data.id,
//           type: 'ai',
//           content: data.content,
//           timestamp: data.timestamp,
//           metadata: data.metadata
//         }]);
//         break;
//     }
//   };

//   const sendMessage = (message: string) => {
//     if (!message.trim() || !wsRef.current || !isConnected) return;

//     const messageData = {
//       type: 'user_message',
//       content: message,
//       negotiationId: params.id,
//       timestamp: new Date().toISOString()
//     };

//     wsRef.current.send(JSON.stringify(messageData));
    
//     // Optimistically add message to UI
//     setMessages(prev => [...prev, {
//       id: Date.now().toString(),
//       type: 'system',
//       content: message,
//       timestamp: new Date().toISOString()
//     }]);
    
//     setInputMessage('');
//   };

//   const toggleAIAgent = () => {
//     if (!wsRef.current || !isConnected) return;

//     const newState = !negotiation?.aiAgentEnabled;
    
//     wsRef.current.send(JSON.stringify({
//       type: 'toggle_ai',
//       enabled: newState,
//       negotiationId: params.id
//     }));

//     if (negotiation) {
//       setNegotiation({
//         ...negotiation,
//         aiAgentEnabled: newState
//       });
//     }
//   };

//   const pauseNegotiation = () => {
//     if (!wsRef.current || !isConnected) return;

//     wsRef.current.send(JSON.stringify({
//       type: 'pause',
//       negotiationId: params.id
//     }));

//     setShowPauseModal(false);
//     router.push('/negotiations');
//   };

//   const acceptOffer = () => {
//     if (!wsRef.current || !isConnected) return;

//     wsRef.current.send(JSON.stringify({
//       type: 'accept',
//       negotiationId: params.id,
//       offer: negotiation?.currentOffer
//     }));

//     setShowAcceptModal(false);
//   };

//   const rejectOffer = () => {
//     if (!wsRef.current || !isConnected) return;

//     wsRef.current.send(JSON.stringify({
//       type: 'reject',
//       negotiationId: params.id
//     }));

//     setShowRejectModal(false);
//     router.push('/negotiations');
//   };

//   const sendCounterOffer = () => {
//     // This would open a counter-offer form
//     // Implementation depends on your specific requirements
//     console.log('Counter offer clicked');
//   };

//   if (!negotiation) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading negotiation...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <button
//               onClick={() => router.push('/negotiations')}
//               className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center"
//             >
//               ← Back to Negotiations
//             </button>
//             <h1 className="text-2xl font-bold text-gray-900">
//               {negotiation.title}
//             </h1>
//             <p className="text-sm text-gray-500">{negotiation.counterparty}</p>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-700">AI Agent</span>
//               <Switch
//                 checked={negotiation.aiAgentEnabled}
//                 onCheckedChange={toggleAIAgent}
//               />
//             </div>
//             <div className={cn(
//               "h-2 w-2 rounded-full",
//               isConnected ? "bg-green-500" : "bg-red-500"
//             )} />
//           </div>
//         </div>
//       </div>

//       {/* Messages Area */}
//       <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
//         <div className="max-w-4xl mx-auto space-y-4">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={cn(
//                 "flex",
//                 message.type === 'ai' ? "justify-start" : "justify-end"
//               )}
//             >
//               <div
//                 className={cn(
//                   "max-w-2xl rounded-lg p-4",
//                   message.type === 'ai' && "bg-blue-50",
//                   message.type === 'counterparty' && "bg-green-50",
//                   message.type === 'alert' && "bg-yellow-50 border border-yellow-200",
//                   message.type === 'system' && "bg-gray-100"
//                 )}
//               >
//                 <div className="flex items-start gap-2">
//                   {message.type === 'ai' && (
//                     <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                       AI
//                     </div>
//                   )}
//                   {message.type === 'counterparty' && (
//                     <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
//                       CP
//                     </div>
//                   )}
                  
//                   <div className="flex-1">
//                     <p className="text-gray-900">{message.content}</p>
//                     {message.metadata && (
//                       <div className="mt-2 text-sm text-gray-600">
//                         {message.metadata.price && (
//                           <p>Price: ${message.metadata.price.toLocaleString()}</p>
//                         )}
//                         {message.metadata.quantity && (
//                           <p>Quantity: {message.metadata.quantity}</p>
//                         )}
//                         {message.metadata.paymentTerms && (
//                           <p>Payment Terms: {message.metadata.paymentTerms}</p>
//                         )}
//                       </div>
//                     )}
//                     <p className="text-xs text-gray-500 mt-2">
//                       {new Date(message.timestamp).toLocaleTimeString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </ScrollArea>

//       {/* Human-in-the-Loop Controls */}
//       {negotiation.currentOffer && negotiation.status === 'active' && (
//         <div className="bg-yellow-50 border-t border-yellow-200 px-6 py-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <AlertTriangle className="h-5 w-5 text-yellow-600" />
//                 <span className="text-sm font-medium text-gray-900">
//                   ALERT: Counterparty proposal (${negotiation.currentOffer.price.toLocaleString()}) 
//                   {negotiation.currentOffer.price > negotiation.budgetConstraints.maxPrice 
//                     ? ' exceeds maximum budget'
//                     : ' within budget range'}
//                   . Requesting human intervention.
//                 </span>
//               </div>
              
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setShowPauseModal(true)}
//                 >
//                   <Pause className="h-4 w-4 mr-2" />
//                   Pause
//                 </Button>
//                 <Button
//                   variant="destructive"
//                   size="sm"
//                   onClick={() => setShowRejectModal(true)}
//                 >
//                   <XCircle className="h-4 w-4 mr-2" />
//                   Reject and counter
//                 </Button>
//                 <Button
//                   variant="default"
//                   size="sm"
//                   onClick={() => setShowAcceptModal(true)}
//                   className="bg-green-600 hover:bg-green-700"
//                 >
//                   <CheckCircle2 className="h-4 w-4 mr-2" />
//                   Accept offer
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Input Area */}
//       <div className="bg-white border-t px-6 py-4">
//         <div className="max-w-4xl mx-auto flex gap-2">
//           <Input
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             onKeyPress={(e) => {
//               if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 sendMessage(inputMessage);
//               }
//             }}
//             placeholder="Enter text here"
//             disabled={!isConnected || negotiation.status !== 'active'}
//             className="flex-1"
//           />
//           <Button
//             onClick={() => sendMessage(inputMessage)}
//             disabled={!inputMessage.trim() || !isConnected || negotiation.status !== 'active'}
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Modals */}
//       <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Pause Negotiation</DialogTitle>
//             <DialogDescription>
//               You're about to revisit this negotiation. You can either continue from where you left off or make adjustments to your offer details before resuming.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowPauseModal(false)}>
//               Cancel
//             </Button>
//             <Button onClick={pauseNegotiation}>
//               Continue to negotiation
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Accept Final Offer</DialogTitle>
//             <DialogDescription>
//               You are about to accept this final offer. Once confirmed, the negotiation will be closed and recorded as successful. Do you wish to proceed?
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAcceptModal(false)}>
//               View details
//             </Button>
//             <Button 
//               onClick={acceptOffer}
//               className="bg-green-600 hover:bg-green-700"
//             >
//               Accept offer
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Reject Final Offer</DialogTitle>
//             <DialogDescription>
//               You are about to reject this final offer. This action will close the negotiation without an agreement. Do you wish to proceed?
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowRejectModal(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={rejectOffer}>
//               Reject offer
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
