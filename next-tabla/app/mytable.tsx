import React, { useState, useEffect,  } from "react";
import "./mytable.css"; 
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Selection,
  SortDescriptor,
  Pagination,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {Button} from "@nextui-org/button";
import {data, columns, columns_select} from "./data"
/*import "react-datepicker/dist/react-datepicker.css";*/
import {filterDate} from "./utils";
import {Tooltip} from "@nextui-org/tooltip";
import {AiOutlineEye} from "react-icons/ai";
import {PiArrowDownFill} from "react-icons/pi";
import {LuRefreshCw} from "react-icons/lu";
import {HiTrash} from "react-icons/hi";
import { PDFDownloadLink} from '@react-pdf/renderer';
import {CircularProgress} from "@nextui-org/react";
import {BiMenuAltLeft} from "react-icons/bi";
import { PDFViewer} from '@react-pdf/renderer';
import { CreatePDF } from './drag_and_drop/renderPdf';
import {HandleZip} from "./drag_and_drop/createZip";

type User = typeof data[0];


export default function App() {

  const [page, setPage] = React.useState(1);
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState(4);
  const [selectValue, setValue] =  React.useState<Selection>(new Set([]));
  const [listPdfs, setlistPdfs] = useState<number[]>([]);
  /*
  const [dateStart, setDateStart] = React.useState<Date | null>(null);
  const [dateEnd, setDateEnd] = React.useState<Date | null>(null);
  */
  const [isModalOpenPdf, setIsModalOpenPdf] = useState(false);
  const [isModalOpenDownload, setIsModalOpenDownload] = useState(false);
  const [isModalOpenAssembly, setIsModalOpenAssembly] = useState(false);
  const [identifier, setId] = useState<number | null>(null);
  const arrayIdentifiersRef = React.useRef<number[]>([]);
  const [optionButton, setOptionButton] = useState<number | null>(null);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "age",
    direction: "ascending",
  });  

  /* The `useEffect` hook is used to perform side effects in a functional component. In this case, the
  effect is triggered whenever the `selectedKeys` or `data.length` values change. */
  useEffect(() => {
    let arrayKeys: string[] = Array.from(selectedKeys).map(key => key.toString());
    if (arrayKeys[0] === 'a') {
      arrayIdentifiersRef.current = Array.from({length: data.length}, (_, i) => i + 1);
      setlistPdfs(arrayIdentifiersRef.current);
    } else {
      arrayIdentifiersRef.current = arrayKeys.map(Number);
      setlistPdfs(arrayIdentifiersRef.current);
    }
    console.log("array de ids" + arrayIdentifiersRef.current);

  }, [selectedKeys, data.length]);

  const hasSearchFilter = Boolean(filterValue);


  /* The code is using the `useMemo` hook to memoize the filtered items based on the `data`,
  `hasSearchFilter`, `filterValue`, and `statusFilter` variables. */
  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...data];
  
    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
  
    return filteredUsers;
  }, [data, hasSearchFilter, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);


  /* The `items` constant is using the `useMemo` hook to memoize a subset of the `filteredItems` array
  based on the current `page` and `rowsPerPage` values. */
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);


  /* Order and filter columns */
  /* The `sortedItems` constant is using the `useMemo` hook to memoize a sorted subset of the `items`
  array based on the current `sortDescriptor` and `selectValue` values. */
  const sortedItems = React.useMemo(() => {    
    let state = 0
    let sortedData = [...items];
    let uploaded_data = [...items];
    
    let last_report_data = data.filter((item) => item.last_update_date !== null);
    //If the selected field of the item is equal to upload_date, order by upload date    
    if (Array.from(selectValue).toString() == "upload_date") {
      state = 1;
      uploaded_data = data.sort((a, b) => {
        const dateA = new Date(a.creation_date);
        const dateB = new Date(b.creation_date);
      
        if (dateA < dateB) {
          return -1;
        } else if (dateA > dateB) {
          return 1;
        } else {
          return 0;
        }
      }
      );
      //We update the status of the page
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      uploaded_data = uploaded_data.slice(start, end);

    //If the selected field of the item is equal to last_reported, sort by last report date
    }else if (Array.from(selectValue).toString() == "last_reported") {
      state = 2;
      last_report_data = data.sort((a, b) => {
        const dateA = new Date(filterDate(a.last_update_date));
        const dateB = new Date(filterDate(b.last_update_date));
        console.log(dateA, dateB);
      
        if (dateA < dateB) {
          return -1;
        } else if (dateA > dateB) {
          return 1;
        } else {
          return 0;
        }
      }
      );
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
      last_report_data = last_report_data.slice(start, end);

      //If the selected field of the item is equal to none, it takes the default sorting
    } else if (Array.from(selectValue).toString() == "none") {
      state = 0;
      sortedData = sortedData.sort((a: User, b: User) => {
        const first = a[sortDescriptor.column as keyof User] as number;
        const second = b[sortDescriptor.column as keyof User] as number;
        const cmp = first < second ? -1 : first > second ? 1 : 0;
  
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      });
      
    }
    /* Depending on the filter it will return some data or another */
    if (state ==1 ){
      return uploaded_data;
    }else if (state == 2){
      return last_report_data;
    }else if (state == 0){
      return sortedData;
    }
    

  }, [sortDescriptor, items, selectValue,items, items.length, page, pages, hasSearchFilter, filteredItems.length]);


  
  const onSearchChange = React.useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      console.log("value", value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  
  const onClear = React.useCallback(()=>{
    setFilterValue("")
    setPage(1)
  },[])


  const renderCell = React.useCallback((item, columnKey) => {
      const requiresUserValidation = item.requires_user_validation;
      const regenerating = item.is_regenerating;
  
      switch (columnKey) {
        case 'name':
          return item.name;
        case "Detailed_report":
          return (
            <div className="button-container">
          <Tooltip content="Visualizar" style={{ color: 'orange'}} isDisabled={requiresUserValidation || regenerating}>
          <Button
            isIconOnly
            isDisabled={requiresUserValidation || regenerating}
            className="my-button"
            onClick={() => {setIsModalOpenPdf(true); setId(item.key); setOptionButton(1)}}>
          <AiOutlineEye size="1.5rem"/>
          </Button>
          </Tooltip>
          {/* Esto inhabilita la descarga del PDF si is_regenerating y validation son true */}
          {!regenerating && !requiresUserValidation ? (
              <PDFDownloadLink document={<CreatePDF id={item.key} option={1} />} fileName="documento.pdf">
              <Tooltip content="Descargar" style={{ color: 'orange'}} isDisabled={requiresUserValidation || regenerating}>
                <Button 
                  isIconOnly
                  isDisabled={requiresUserValidation || regenerating} 
                  className="my-button">
                  <PiArrowDownFill size="1.5rem"/>
                </Button>
              </Tooltip>
            </PDFDownloadLink>
            ) : (
              <Tooltip content="Descargar" style={{ color: 'orange'}} isDisabled={true}>
                <Button 
                  isIconOnly
                  onClick={() => console.log("Descargar")}
                  isDisabled={true} 
                  className="my-button">
                  <PiArrowDownFill size="1.5rem"/>
                </Button>
              </Tooltip>
            )}
          </div>
          );
          case "Summary_report":
            return(
              <div className="button-container">
          <Tooltip content="Visualizar" style={{ color: 'orange'}} isDisabled={requiresUserValidation || regenerating}>
          <Button
            isIconOnly
            isDisabled={requiresUserValidation || regenerating}
            className="my-button"
            onClick={() => {setIsModalOpenPdf(true); setId(item.key); setOptionButton(2)}}>
          <AiOutlineEye size="1.5rem"/>
          </Button>
          </Tooltip>
          {/* Esto inhabilita la descarga del PDF si is_regenerating y validation son true */}
          {!regenerating && !requiresUserValidation ? (
              <PDFDownloadLink document={<CreatePDF id={item.key} option={2} />} fileName="documento.pdf">
              <Tooltip content="Descargar" style={{ color: 'orange'}} isDisabled={requiresUserValidation || regenerating}>
                <Button 
                  isIconOnly
                  isDisabled={requiresUserValidation || regenerating} 
                  className="my-button">
                  <PiArrowDownFill size="1.5rem"/>
                </Button>
              </Tooltip>
            </PDFDownloadLink>
            ) : (
              <Tooltip content="Descargar" style={{ color: 'orange'}} isDisabled={true}>
                <Button 
                  isIconOnly
                  isDisabled={true} 
                  className="my-button">
                  <PiArrowDownFill size="1.5rem"/>
                </Button>
              </Tooltip>
            )}
          </div>
            );
          case "Actions":
            if (regenerating == true){
              return(
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress color="primary" aria-label="Loading..."/>
                </div>
              );
              }else if (requiresUserValidation == false){
            return(
              <div className="button-container">
          <Tooltip content="Regenerar" style={{ color: 'orange'}}>
          <Button 
          isIconOnly
          className="my-button"
          isDisabled={requiresUserValidation ? true : false} 
          onClick={() => console.log("Boton regenerar")}>
          <LuRefreshCw size="1.5rem"/>
          </Button>
          </Tooltip>
          <Tooltip content="Eliminar" style={{ color: 'orange'}}>
          <Button 
          isIconOnly
          isDisabled={requiresUserValidation ? true : false} 
          className="my-button" 
          onClick={() => (console.log("Boton borrar"))}>
          <HiTrash size="1.5rem"/>
          </Button>
          </Tooltip>
          </div>
            );
          }else{
              return(
                <div>
            <Tooltip content="Validar" style={{color: 'orange'}}>
            <Button 
            className="my-button" onClick={() => setIsModalOpenAssembly(true)}>
              Assembly
            </Button>
            </Tooltip>
            </div>
              );
              
            }
            default:
              // Default behavior: return the value of the property specified by columnKey
              return item[columnKey as string];
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4" id="fondo-blanco">
                <div className="flex gap-4 h-full"
                style={{
                  display: "flex",
                  backgroundColor: "white",
                }}>
                  <div className="w-1/4 h-full" id="input-filter">
                    <Input
                      label="Filter"
                      isClearable
                      placeholder="Search by name..."
                      /* startContent={<BsSearch />} */
                      value={filterValue}
                      onClear={() => onClear()}
                      onValueChange={onSearchChange}
                    />
                  </div>
                  <div className="w-2/4 h-full">
                <Select
                  style={{backgroundColor:"transparent", width:"15rem"}}
                  /* label="Ordenar por:" */
                  placeholder="Filter by..."
                  startContent={<BiMenuAltLeft color="#F17F16"/>}
                  className="max-w-xs select-box"
                  selectedKeys={Array.from(selectValue)}
                  onSelectionChange={(keys) => setValue(new Set(keys))}
                >
                  {columns_select.map((cd) => (
                    <SelectItem key={cd.value} value={cd.value} className="item-select">
                      {cd.label}
                    </SelectItem>
                  ))}
                </Select>
                </div>
                <div style={
                {
                  marginLeft: "auto",
                }
              }>
              <Button isDisabled={selectedKeys.size === 0}
              className="my-button-all" onClick={() => {/*HandleZip(arrayIdentifiersRef.current*/ setIsModalOpenDownload(true)}}
              isIconOnly>
              <PiArrowDownFill size="1.5rem"/>
              </Button>
              <Button isDisabled={selectedKeys.size === 0}
              className="my-button-all" onClick={() => {console.log("Borrar")}}
              isIconOnly>
              <HiTrash size="1.5rem"/>
              </Button>
              </div> 
              </div>
                </div>
    );
  }, [selectedKeys, filterValue, selectValue, data.length, page, pages, hasSearchFilter, filteredItems.length]);


  const bottomContent = React.useMemo(() => {
    
    return(
        <div className="py-2 px-2 flex justify-between items-center">
        <span className="w-[30%] text-small text-default-400">
          {selectedKeys === "all"
            ? "All items selected"
            : `${selectedKeys.size} of ${filteredItems.length} selected`}
        </span>
         <Pagination
              isCompact
              showControls
              color="primary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
      </div>
        );
}, [selectedKeys, filteredItems.length, page, pages]);

  /* Table content and aspect */
  return (
    <div>
    <Table
      style={{
        backgroundColor: "white",
        borderRadius: "10px",
        textAlign: "center"
      }}
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}    
      >
      <TableHeader
      style={{ textAlign: "center" }}
        columns={columns}>
        {(column) => <TableColumn
        key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody
      items={sortedItems}>
        {(item) => (  // Aquí definimos el tipo de item
          <TableRow key={item.key}>
            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
    {isModalOpenPdf && identifier !== null && optionButton !== null && (
            <div className="modal">
              <div className="modal-content">
                <PDFViewer style={{ width: "100%", height: "90vh" }}>
                  <CreatePDF id={identifier} option={optionButton} />
                </PDFViewer>
                <Button onClick={() => setIsModalOpenPdf(false)}>Close PDF</Button>
              </div>
            </div>
          )}
          {isModalOpenDownload &&(
            <div className="modal">
              <div className="modal-content-download">
                <h1 className="tittle-modal-download">Select the type of the report</h1>
                <div className="modal-download-box">
                <Button className="button-modal-download" onClick={() => {HandleZip(arrayIdentifiersRef.current, 1)}}>Download  detailed report</Button>
                <Button className="button-modal-download" onClick={() => {HandleZip(arrayIdentifiersRef.current, 2)}}>Download summary report</Button>
                <Button className="button-modal-download" onClick={()=> setIsModalOpenDownload(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}

          {isModalOpenAssembly &&(
            <div className="modal">
              <div className="modal-content-download">
                <h1 className="tittle-modal-download">Assembly</h1>
                <div className="modal-download-box">
                <Button className="button-modal-download">Opción 1</Button>
                <Button className="button-modal-download">Opción 2</Button>
                <Button className="button-modal-download" onClick={()=> setIsModalOpenAssembly(false)}>Close</Button>
                </div>
              </div>
            </div>
          )}
  </div>
  );
}


