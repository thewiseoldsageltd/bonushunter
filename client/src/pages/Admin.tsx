import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Play, Square, RefreshCw, Plus, Edit, Trash2, Eye } from 'lucide-react';

interface ScrapingStatus {
  isRunning: boolean;
  lastUpdate?: string;
  bonusesScraped?: number;
  operatorsCount?: number;
}

interface BonusFormData {
  title: string;
  description: string;
  operatorId: string;
  productType: string;
  bonusType: string;
  matchPercent: string;
  minDeposit: string;
  maxBonus: string;
  promoCode: string;
  landingUrl: string;
  wageringRequirement: string;
  expiryDays: string;
  valueScore: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scrapingStatus, setScrapingStatus] = useState<ScrapingStatus>({ isRunning: false });
  const [editingBonus, setEditingBonus] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bonusForm, setBonusForm] = useState<BonusFormData>({
    title: '',
    description: '',
    operatorId: '',
    productType: 'sportsbook',
    bonusType: 'first_bet_bonus',
    matchPercent: '0',
    minDeposit: '0',
    maxBonus: '0',
    promoCode: '',
    landingUrl: '',
    wageringRequirement: '1',
    expiryDays: '30',
    valueScore: '85'
  });

  // Fetch all bonuses
  const { data: bonusesData, isLoading: loadingBonuses } = useQuery({
    queryKey: ['/api/bonuses']
  });

  // Fetch operators
  const { data: operatorsData } = useQuery({
    queryKey: ['/api/admin/operators']
  });

  // Start scraping mutation
  const startScrapingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/scraping/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: [] })
      });
    },
    onSuccess: () => {
      setScrapingStatus({ isRunning: true });
      toast({
        title: "Scraping Started",
        description: "Live bonus data collection has begun!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Scraping Failed",
        description: error.message || "Could not start bonus scraping",
        variant: "destructive",
      });
    }
  });

  // Stop scraping mutation
  const stopScrapingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/admin/scraping/stop', {
        method: 'POST'
      });
    },
    onSuccess: () => {
      setScrapingStatus({ isRunning: false });
      toast({
        title: "Scraping Stopped",
        description: "Bonus data collection has been stopped.",
      });
    }
  });

  // Manual scrape mutation
  const manualScrapeMutation = useMutation({
    mutationFn: async (operatorId: string) => {
      return await apiRequest(`/api/admin/scraping/manual/${operatorId}`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      toast({
        title: "Manual Scrape Complete",
        description: `Scraping completed successfully`,
      });
    }
  });

  // Add bonus mutation
  const addBonusMutation = useMutation({
    mutationFn: async (bonusData: any) => {
      return await apiRequest('/api/admin/bonuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bonusData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bonuses'] });
      setShowAddForm(false);
      setBonusForm({
        title: '',
        description: '',
        operatorId: '',
        productType: 'sportsbook',
        bonusType: 'first_bet_bonus',
        matchPercent: '0',
        minDeposit: '0',
        maxBonus: '0',
        promoCode: '',
        landingUrl: '',
        wageringRequirement: '1',
        expiryDays: '30',
        valueScore: '85'
      });
      toast({
        title: "Bonus Added",
        description: "New bonus has been created successfully!",
      });
    }
  });

  const handleAddBonus = () => {
    const bonusData = {
      ...bonusForm,
      matchPercent: parseFloat(bonusForm.matchPercent),
      minDeposit: parseFloat(bonusForm.minDeposit),
      maxBonus: parseFloat(bonusForm.maxBonus),
      wageringRequirement: parseFloat(bonusForm.wageringRequirement),
      expiryDays: parseInt(bonusForm.expiryDays),
      valueScore: parseFloat(bonusForm.valueScore),
      existingUserEligible: false,
      status: 'active'
    };
    addBonusMutation.mutate(bonusData);
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-dashboard">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="outline" className="text-sm">
          Real Data Management
        </Badge>
      </div>

      <Tabs defaultValue="scraping" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scraping">Live Scraping</TabsTrigger>
          <TabsTrigger value="bonuses">Bonus Management</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Live Scraping Tab */}
        <TabsContent value="scraping">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Automated Bonus Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Status: <Badge variant={scrapingStatus.isRunning ? "default" : "secondary"}>
                        {scrapingStatus.isRunning ? "Running" : "Stopped"}
                      </Badge>
                    </p>
                    {scrapingStatus.lastUpdate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {scrapingStatus.lastUpdate}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startScrapingMutation.mutate()}
                      disabled={scrapingStatus.isRunning || startScrapingMutation.isPending}
                      size="sm"
                      data-testid="button-start-scraping"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Scraping
                    </Button>
                    <Button
                      onClick={() => stopScrapingMutation.mutate()}
                      disabled={!scrapingStatus.isRunning || stopScrapingMutation.isPending}
                      variant="outline"
                      size="sm"
                      data-testid="button-stop-scraping"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">{(bonusesData as any)?.total || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Bonuses</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">10</p>
                    <p className="text-sm text-muted-foreground">Active Operators</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">15</p>
                    <p className="text-sm text-muted-foreground">Jurisdictions</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Manual Scraping</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['DraftKings', 'FanDuel', 'BetMGM', 'Caesars'].map((operator) => (
                      <Button
                        key={operator}
                        variant="outline"
                        size="sm"
                        onClick={() => manualScrapeMutation.mutate(operator.toLowerCase())}
                        disabled={manualScrapeMutation.isPending}
                        data-testid={`button-scrape-${operator.toLowerCase()}`}
                      >
                        Scrape {operator}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bonus Management Tab */}
        <TabsContent value="bonuses">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Bonus Management</h3>
              <Button 
                onClick={() => setShowAddForm(true)}
                data-testid="button-add-bonus"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Bonus
              </Button>
            </div>

            {showAddForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Bonus</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={bonusForm.title}
                        onChange={(e) => setBonusForm({...bonusForm, title: e.target.value})}
                        placeholder="Bonus title"
                        data-testid="input-bonus-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="operatorId">Operator</Label>
                      <Select value={bonusForm.operatorId} onValueChange={(value) => setBonusForm({...bonusForm, operatorId: value})}>
                        <SelectTrigger data-testid="select-operator">
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draftkings">DraftKings</SelectItem>
                          <SelectItem value="fanduel">FanDuel</SelectItem>
                          <SelectItem value="betmgm">BetMGM</SelectItem>
                          <SelectItem value="caesars">Caesars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={bonusForm.description}
                      onChange={(e) => setBonusForm({...bonusForm, description: e.target.value})}
                      placeholder="Bonus description"
                      data-testid="input-bonus-description"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="productType">Product Type</Label>
                      <Select value={bonusForm.productType} onValueChange={(value) => setBonusForm({...bonusForm, productType: value})}>
                        <SelectTrigger data-testid="select-product-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sportsbook">Sportsbook</SelectItem>
                          <SelectItem value="casino">Casino</SelectItem>
                          <SelectItem value="poker">Poker</SelectItem>
                          <SelectItem value="crypto_casino">Crypto Casino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxBonus">Max Bonus ($)</Label>
                      <Input
                        id="maxBonus"
                        type="number"
                        value={bonusForm.maxBonus}
                        onChange={(e) => setBonusForm({...bonusForm, maxBonus: e.target.value})}
                        data-testid="input-max-bonus"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minDeposit">Min Deposit ($)</Label>
                      <Input
                        id="minDeposit"
                        type="number"
                        value={bonusForm.minDeposit}
                        onChange={(e) => setBonusForm({...bonusForm, minDeposit: e.target.value})}
                        data-testid="input-min-deposit"
                      />
                    </div>
                    <div>
                      <Label htmlFor="valueScore">Value Score</Label>
                      <Input
                        id="valueScore"
                        type="number"
                        value={bonusForm.valueScore}
                        onChange={(e) => setBonusForm({...bonusForm, valueScore: e.target.value})}
                        data-testid="input-value-score"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="landingUrl">Landing URL</Label>
                    <Input
                      id="landingUrl"
                      value={bonusForm.landingUrl}
                      onChange={(e) => setBonusForm({...bonusForm, landingUrl: e.target.value})}
                      placeholder="https://operator.com/promo"
                      data-testid="input-landing-url"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddBonus}
                      disabled={addBonusMutation.isPending}
                      data-testid="button-save-bonus"
                    >
                      Save Bonus
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                      data-testid="button-cancel-add"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {loadingBonuses ? (
                <p>Loading bonuses...</p>
              ) : (
                (bonusesData as any)?.bonuses?.map((bonus: any) => (
                  <Card key={bonus.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{bonus.title}</h4>
                            <Badge variant="outline">{bonus.operator.name}</Badge>
                            <Badge variant="secondary">{bonus.productType}</Badge>
                            <Badge variant="outline">Score: {bonus.valueScore}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{bonus.description}</p>
                          <div className="flex gap-4 text-xs text-muted-foreground">
                            <span>Max: ${bonus.maxBonus}</span>
                            <span>Min Deposit: ${bonus.minDeposit}</span>
                            <span>Wagering: {bonus.wageringRequirement}x</span>
                            <span>Expires: {bonus.expiryDays}d</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" data-testid={`button-view-${bonus.id}`}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-edit-${bonus.id}`}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-delete-${bonus.id}`}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators">
          <Card>
            <CardHeader>
              <CardTitle>Operator Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {['DraftKings', 'FanDuel', 'BetMGM', 'Caesars', 'Stake.com', 'Bet365'].map((operator) => (
                  <div key={operator} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{operator}</h4>
                      <p className="text-sm text-muted-foreground">Active • Last scraped: 2 hours ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">Active</Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Web Scraping</span>
                    <Badge>Primary</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Entry</span>
                    <Badge variant="secondary">Secondary</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>API Feeds</span>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Accuracy</span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freshness</span>
                    <span className="font-medium">6 hours avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage</span>
                    <span className="font-medium">10 operators</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;