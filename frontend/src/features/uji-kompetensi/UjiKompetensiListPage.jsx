// frontend/src/features/uji-kompetensi/UjiKompetensiListPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Card, Title, Text, Button, Badge, Grid, Select, SelectItem } from "@tremor/react";
import { FiPlus, FiPlay, FiCheckCircle, FiClock, FiActivity, FiGrid, FiList, FiSearch, FiFilter, FiCalendar, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/api";
import AppResourceTable from "../../components/common/AppResourceTable";
import SelectSchemeModal from "./components/SelectSchemeModal";
import { formatDate } from "../../utils/formatters";
import { toast } from "sonner";

function UjiKompetensiListPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- State untuk Filter & View ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // 'list' atau 'grid'

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get("/competency-tests");
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data uji kompetensi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Logic Filter & Sorting ---
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 1. Filter Pencarian
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter((item) => item.title.toLowerCase().includes(lowerQuery));
    }

    // 2. Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "a-z":
          return a.title.localeCompare(b.title);
        case "z-a":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    return result;
  }, [data, searchQuery, sortOption]);

  // Handler Create
  const handleCreateNewClick = () => {
    setIsModalOpen(true);
  };

  const handleSchemeSelected = async (schemeId, title) => {
    try {
      // Kirim scheme_id dan title ke backend
      const res = await apiClient.post("/competency-tests", {
        title: title,
        scheme_id: schemeId,
      });
      toast.success("Kegiatan berhasil dibuat!");
      setIsModalOpen(false);
      navigate(`/uji-kompetensi/studio/${res.data.id}`);
    } catch (error) {
      toast.error("Gagal membuat data.");
    }
  };

  // --- Definisi Kolom Tabel (Mode List) ---
  const columns = [
    {
      key: "title",
      header: "Nama Kegiatan",
      cell: (item) => (
        <div className="cursor-pointer group flex items-center gap-3" onClick={() => navigate(`/uji-kompetensi/studio/${item.id}`)}>
          <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
            <FiActivity size={14} />
          </div>
          <div>
            <Text className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{item.title}</Text>
          </div>
        </div>
      ),
    },
    {
      key: "creator_name",
      header: "Asesor / Pembuat",
      cell: (item) => (
        <div className="flex items-center gap-2 text-gray-600">
          <FiUser className="w-3 h-3" />
          <Text>{item.creator_name}</Text>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => (
        <Badge size="xs" color={item.status === "DRAFT" ? "gray" : "blue"}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Tanggal Dibuat",
      cell: (item) => (
        <div className="flex items-center gap-2 text-gray-500">
          <FiClock className="w-3 h-3" />
          <Text>{formatDate(item.created_at)}</Text>
        </div>
      ),
    },
    {
      key: "action",
      header: "Aksi",
      cell: (item) => (
        <div className="flex justify-end gap-2">
          <Button
            size="xs"
            variant="secondary"
            icon={FiPlay}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/uji-kompetensi/studio/${item.id}`);
            }}
          >
            Buka Studio
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div className="p-6 sm:p-10 bg-slate-50 min-h-screen space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600 shadow-sm">
            <FiCheckCircle size={28} />
          </div>
          <div>
            <Title className="text-2xl text-slate-800">Uji Kompetensi</Title>
            <Text className="text-slate-500">Manajemen kegiatan sertifikasi dan asesmen.</Text>
          </div>
        </div>

        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <Button
            size="lg"
            icon={viewMode === "list" ? FiGrid : FiList}
            variant="secondary"
            onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")}
            title={viewMode === "list" ? "Tampilan Grid" : "Tampilan Tabel"}
            className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 rounded-xl"
          />
          {/* Create Button */}
          <Button size="lg" icon={FiPlus} onClick={handleCreateNewClick} className="shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all rounded-xl">
            Uji Kompetensi
          </Button>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <Card className="p-4 shadow-sm border border-gray-100 rounded-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
          {/* Search */}
          <div className="relative flex-grow w-full">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari nama kegiatan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="w-full md:w-56 flex-shrink-0">
            <Select value={sortOption} onValueChange={setSortOption} icon={FiFilter} placeholder="Urutkan..." className="h-[42px]">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="oldest">Terlama</SelectItem>
              <SelectItem value="a-z">Abjad A-Z</SelectItem>
              <SelectItem value="z-a">Abjad Z-A</SelectItem>
            </Select>
          </div>
        </div>
      </Card>

      {/* --- CONTENT AREA --- */}
      {viewMode === "list" ? (
        /* MODE LIST (TABLE) */
        <Card className="p-0 overflow-hidden shadow-sm border border-gray-100 rounded-xl">
          <AppResourceTable data={filteredAndSortedData} isLoading={isLoading} columns={columns} emptyMessage="Belum ada kegiatan uji kompetensi yang ditemukan." />
        </Card>
      ) : (
        /* MODE GRID (CARD) */
        <div className="mt-2">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500">Memuat data...</div>
          ) : filteredAndSortedData.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-xl bg-white">
              <Text>Tidak ada data ditemukan.</Text>
            </div>
          ) : (
            <Grid numItemsSm={1} numItemsMd={2} numItemsLg={3} className="gap-6">
              {filteredAndSortedData.map((item) => (
                <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow border-t-4 border-t-indigo-500 cursor-pointer group h-full justify-between" onClick={() => navigate(`/uji-kompetensi/studio/${item.id}`)}>
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <FiActivity size={20} />
                      </div>
                      <Badge size="xs" color={item.status === "DRAFT" ? "gray" : "blue"}>
                        {item.status}
                      </Badge>
                    </div>

                    <Title className="text-lg font-bold group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">{item.title}</Title>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{item.creator_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(item.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end">
                    <Button
                      size="xs"
                      variant="light"
                      icon={FiPlay}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/uji-kompetensi/studio/${item.id}`);
                      }}
                    >
                      Buka Studio
                    </Button>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </div>
      )}
      <SelectSchemeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSelect={handleSchemeSelected} />
    </div>
  );
}

export default UjiKompetensiListPage;
