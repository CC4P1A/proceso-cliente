import { useEffect, useState, useRef } from 'react';
import { FaBitcoin } from 'react-icons/fa';

const HOST = '127.0.0.1';
const PORT = 60000;

export default function App() {
	const [socket, setSocket] = useState(null);
	const [dataReceive, setDataReceive] = useState('');
    const [read, setRead] = useState('');
    const [transaction, setTransaction] = useState('');

    // search input
    const [searchInput, setSearchInput] = useState('');
	const searchInputRef = useRef('');

    // from input
    const [fromInput, setFromInput] = useState('');
    const fromInputRef = useRef('');

    // to input
    const [toInput, setToInput] = useState('');
    const toInputRef = useRef('');

    // amount input
    const [amountInput, setAmountInput] = useState('');
    const amountInputRef = useRef('');

	useEffect(() => {
		// Close the socket when the component unmounts
		return () => {
			if (socket) {
				// Close event listener
				socket.removeEventListener('close', () => {
					console.log('Desconectado...');
				});

				// Message event listener
				socket.removeEventListener('message', (event) => {
					setDataReceive(event.data);
					console.log('Mensaje recibido:', event.data);
				});

				// Open event listener
				socket.removeEventListener('open', () => {
					console.log('Conectado...');
				});

				// Close the socket
				socket.close();
				setSocket(null);
			}
		};
	}, [socket]);

    useEffect(() => {
        if (dataReceive === ''){
            return;
        }
        const data = JSON.parse(dataReceive);
        if (data.type === 'L') {
            setRead(data);
        } else if (data.type === 'A') {
            setTransaction(data);
        }
    }, [dataReceive]);

	const handleConnect = () => {
		// Create a new socket and connect to the server
		const newSocket = new WebSocket(`ws://${HOST}:${PORT}`);

		// When the socket connects, set the connected state to true
		newSocket.addEventListener('open', () => {
			console.log('Conectado...');
		});

		// When the socket receives data, log it to the console
		newSocket.addEventListener('message', (event) => {
			setDataReceive(event.data);
			console.log('Mensaje recibido:', event.data);
		});

		// When the socket closes, set the connected state to false
		newSocket.addEventListener('close', () => {
			console.log('Desconectado...');
		});

		setSocket(newSocket);
	};

	const handleSearch = (e) => {
		// Prevent the form submitting reload the page
		e.preventDefault();
		// Send a message to the server when the user submits the form
		if (socket && searchInputRef.current !== '') {
			const data = {
				type: 'L',
				origin_account: searchInputRef.current,
			};
			socket.send(JSON.stringify(data));
			console.log('Message sent:', data);
		}
	};

    const handleSendTransaction = (e) => {
        // Prevent the form submitting reload the page
        e.preventDefault();
        // Send a message to the server when the user submits the form
        if (socket && fromInputRef.current !== '' && toInputRef.current !== '' && amountInputRef.current !== '') {
            const data = {
                type: 'A',
                origin_account: fromInputRef.current,
                destination_account: toInputRef.current,
                amount: amountInputRef.current,
            };
            socket.send(JSON.stringify(data));
            console.log('Message sent:', data);
        }
    }

	const handleChangeSearch = (e) => {
		const value = e.target.value;
        setSearchInput(value);
		searchInputRef.current = value;
	};

    const handleChangeFrom = (e) => {
        const value = e.target.value;
        setFromInput(value);
        fromInputRef.current = value;
    }

    const handleChangeTo = (e) => {
        const value = e.target.value;
        setToInput(value);
        toInputRef.current = value;
    }

    const handleChangeAmount = (e) => {
        const value = e.target.value;
        setAmountInput(value);
        amountInputRef.current = value;
    }

	return (
		<>
			<header className="bg-gray-50 shadow-sm">
				<nav className="container max-w-screen-md mx-auto flex justify-between gap-4 py-4">
					<a href="/" className="flex items-center gap-2 text-purple-500">
						<FaBitcoin size={24} className="" />
						<p className="text-xl font-bold">CriptoScan</p>
					</a>
					<button
						type="button"
						onClick={() => handleConnect()}
						className="px-4 py-2 w-[100px] rounded-md bg-purple-500 text-white font-bold">
						Connect
					</button>
				</nav>
			</header>
			<main className="text-gray-500">
				<section className="container max-w-screen-md mx-auto flex flex-col gap-4 py-8">
					<h2 className="text-2xl font-medium text-purple-500">Search for id</h2>
					<form className="flex flex-grow gap-4" onSubmit={(e) => handleSearch(e)}>
						<input
							type="text"
							value={searchInput}
							onChange={handleChangeSearch}
							className="flex-grow px-4 py-2 rounded-md border border-purple-200 focus:outline-none"
							placeholder="Search Wallet"
						/>
						<button
							type="submit"
							className="px-4 py-2 w-[100px] rounded-md bg-purple-500 text-white font-bold">
							Search
						</button>
					</form>
                    {
                        read !== '' ? (
                            <div>
                                <p>Account: {read.origin_account} - Balance: {read.origin_amount}</p>
                            </div>
                        ) : null
                    }
				</section>
				<section className="container max-w-screen-md mx-auto flex flex-col gap-4 py-8">
					<h2 className="text-2xl font-medium text-purple-500">Create new transaction</h2>
					<form className="flex  gap-4" onSubmit={(e)=>handleSendTransaction(e)}>
						<div className="flex flex-col gap-2">
							<label htmlFor="from" className="block">
								From
							</label>
							<input
								type="text"
								id="from"
                                value={fromInput}
                                onChange={handleChangeFrom}
								className="w-full px-4 py-2 rounded-md border border-purple-200 focus:outline-none"
								placeholder="Wallet address"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label htmlFor="to" className="block">
								To
							</label>
							<input
								type="text"
								id="to"
                                value={toInput}
                                onChange={handleChangeTo}
								className="w-full px-4 py-2 rounded-md border border-purple-200 focus:outline-none"
								placeholder="Wallet address"
							/>
						</div>
						<div className="flex flex-col gap-2">
							<label htmlFor="amount" className="block">
								Amount
							</label>
							<input
								type="text"
								id="amount"
                                value={amountInput}
                                onChange={handleChangeAmount}
								className="flex-grow w-full px-4 py-2 rounded-md border border-purple-200 focus:outline-none"
								placeholder="Amount"
							/>
						</div>
						<div className="flex items-end">
							<button
								type="submit"
								className="px-4 py-2 w-[100px] rounded-md bg-purple-500 border border-purple-200 text-white font-bold">
								Send
							</button>
						</div>
					</form>
				</section>
			</main>
		</>
	);
}
