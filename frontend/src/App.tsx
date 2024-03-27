import axios from 'axios';
import { SyntheticEvent, useEffect, useRef, useState } from 'react'

type TodoItem = {
  id: number,
  content: string
}

function App() {
  const [todo, setTodo] = useState('')
  const [todos, setTodos] = useState<Array<TodoItem>>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8090').replace(/\/$/, '')

  const fetchTodos = () => {
    axios.get(API_URL+'/todo')
    .then((response: { data : Array<TodoItem>}) => {
      setTodos(response.data);
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchTodos();
  }, [])

  const addTodo = (content: string) => {
    // setTodos([{ id: 1 , content }, ...todos])
    axios.post(API_URL+'/todo', { content })
    .then(() => {
      fetchTodos();
    }).catch(error => {
      console.error(error);
    });
  }

  const handleSubmit = (event: SyntheticEvent) => {
    if (loading) return;
    event.preventDefault();
    setLoading(true);
    addTodo(todo);
    setTodo('')
    inputRef.current?.focus();
  }

  const deleteTodo = (id: number) => {
    const oldTodos = [...todos];
    setTodos(todos.filter(item => item.id != id))
    axios.delete(API_URL+"/todo/"+id).then(() => {
      fetchTodos()
    }).catch(() => {
      setTodos(oldTodos)
    })
  }


  return (
    <>
      <div className="w-full max-w-xl mx-auto">
        <h1 className='text-3xl text-center w-full py-10 border-b'>Todo App</h1>
        <div className="w-full">
          <form className="w-full flex" onSubmit={handleSubmit}>
            <div className="py-4 flex-grow">
              <input ref={inputRef} type="text" onChange={e => setTodo(e.target.value)} value={todo} className='w-full border rounded p-2' required />
            </div>
            <div className="py-2 pl-4 flex justify-center items-center">
              <button className='w-16 text-white bg-blue-500 py-2 px-4 rounded disabled:opacity-75' disabled={loading}>{loading ? '...' : 'Add'}</button>
            </div>
          </form>

          <div className="w-full">
            <h2 className="w-full text-center py-4 text-2xl">Todos</h2>
            <div className="border-t py-4">
              {todos.map(item => (
                <div key={item.id} className="py-2">
                <div className="w-full shadow rounded-lg p-2 flex">
                  <div className="p-2 break-all flex-grow self-center">{item.content}</div>
                  <div className="p-2 flex items-top border-l">
                    <button type='button' onClick={() => deleteTodo(item.id)} className="p-2 hover:bg-slate-100 cursor-pointer self-start rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
                      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                    </svg>
                    </button>
                  </div>
                </div>
              </div>
              ))}
              {todos.length === 0 && (
                <div className="w-full text-center py-4 text-slate-300">
                  No item found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
