import { useMemo, useState } from "react";
import {
  ConfigProvider,
  Layout,
  Typography,
  InputNumber,
  Table,
  Tag,
  Row,
  Col,
  Card,
  Divider,
  Space,
  Statistic,
  Alert,
  Button,
  Progress,
  theme,
} from "antd";
import type { ColumnsType } from "antd/es/table";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// ---- Types ----
type GroupKey = "Потребности" | "Желания" | "Инвестиции";
type Category = { key: string; name: string; group: GroupKey; percent: number };

// ---- Initial data (как на картинке) ----
const initialCategories: Category[] = [
  // Потребности
  { key: "rent", name: "Аренда", group: "Потребности", percent: 35 },
  { key: "groceries", name: "Продукты", group: "Потребности", percent: 15 },
  {
    key: "utilities",
    name: "Коммунальные услуги",
    group: "Потребности",
    percent: 5,
  },
  { key: "mobile", name: "Связь", group: "Потребности", percent: 3 },
  { key: "transport", name: "Транспорт", group: "Потребности", percent: 5 },
  { key: "hygiene", name: "Гигиена", group: "Потребности", percent: 3 },
  { key: "meds", name: "Лекарства", group: "Потребности", percent: 7 },
  // Желания
  { key: "shopping", name: "Шопинг", group: "Желания", percent: 7 },
  { key: "fun", name: "Развлечения", group: "Желания", percent: 5 },
  { key: "travel", name: "Путешествия", group: "Желания", percent: 5 },
  // Инвестиции
  { key: "invest", name: "Инвестиции", group: "Инвестиции", percent: 5 },
  { key: "reserve", name: "Резервный фонд", group: "Инвестиции", percent: 5 },
];

const groupColors: Record<GroupKey, string> = {
  Потребности: "green",
  Желания: "blue",
  Инвестиции: "gold",
};

function currencyFormat(num: number, currency: string = "RUB") {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export default function App() {
  const [budget, setBudget] = useState<number>(100_000);
  const [currency, setCurrency] = useState<string>("RUB");
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  const totals = useMemo(() => {
    const byGroup: Record<GroupKey, number> = {
      Потребности: 0,
      Желания: 0,
      Инвестиции: 0,
    };
    let all = 0;
    categories.forEach((c) => {
      byGroup[c.group] += c.percent;
      all += c.percent;
    });
    return { byGroup, all };
  }, [categories]);

  const dataWithMoney = useMemo(() => {
    return categories.map((c) => ({
      ...c,
      amount: Math.round((budget * c.percent) / 100),
    }));
  }, [categories, budget]);

  const onPercentChange = (key: string, next: number | null) => {
    if (next == null) return;
    setCategories((prev) =>
      prev.map((c) => (c.key === key ? { ...c, percent: next } : c))
    );
  };

  const resetToDefault = () => setCategories(initialCategories);

  const columns: ColumnsType<Category & { amount: number }> = [
    {
      title: "Категория",
      dataIndex: "name",
      key: "name",
      width: 220,
      render: (value, record) => (
        <Space>
          <Tag color={groupColors[record.group]}>{record.group}</Tag>
          <Text>{value}</Text>
        </Space>
      ),
    },
    {
      title: "Процент",
      dataIndex: "percent",
      key: "percent",
      width: 160,
      render: (_value, record) => (
        <InputNumber
          value={record.percent}
          min={0}
          max={100}
          step={0.5}
          onChange={(v) => onPercentChange(record.key, Number(v))}
          addonAfter="%"
        />
      ),
    },
    {
      title: "Сумма",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <Text strong>{currencyFormat(value, currency)}</Text>
      ),
    },
  ];

  const error = totals.all !== 100;

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { borderRadius: 12 },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Header
          style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}
        >
          <Row align="middle" gutter={16}>
            <Col flex="none">
              <Title level={3} style={{ margin: 0 }}>
                Распределение бюджета
              </Title>
            </Col>
          </Row>
        </Header>
        <Content
          style={{
            padding: 24,
            maxWidth: 1100,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Card>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <Title level={4} style={{ marginTop: 0 }}>
                    Введите бюджет
                  </Title>
                  <InputNumber
                    value={budget}
                    onChange={(v) => setBudget(Number(v))}
                    min={0}
                    step={100}
                    prefix={
                      currency === "RUB" ? "₽" : currency === "USD" ? "$" : "€"
                    }
                    style={{ width: "100%" }}
                  />
                  <Space>
                    <Text type="secondary">Валюта отображения:</Text>
                    <Button
                      type={currency === "RUB" ? "primary" : "default"}
                      onClick={() => setCurrency("RUB")}
                    >
                      RUB
                    </Button>
                    <Button
                      type={currency === "USD" ? "primary" : "default"}
                      onClick={() => setCurrency("USD")}
                    >
                      USD
                    </Button>
                    <Button
                      type={currency === "EUR" ? "primary" : "default"}
                      onClick={() => setCurrency("EUR")}
                    >
                      EUR
                    </Button>
                  </Space>
                  <Divider style={{ margin: "8px 0" }} />
                  <Row gutter={12}>
                    <Col span={8}>
                      <Card size="small" bordered>
                        <Statistic
                          title="Потребности (сумма)"
                          value={currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Потребности")
                              .reduce((a, b) => a + b.amount, 0),
                            currency
                          )}
                        />
                        <Progress
                          percent={Number(
                            totals.byGroup["Потребности"].toFixed(2)
                          )}
                          status={error ? "exception" : "normal"}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" bordered>
                        <Statistic
                          title="Желания (сумма)"
                          value={currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Желания")
                              .reduce((a, b) => a + b.amount, 0),
                            currency
                          )}
                        />
                        <Progress
                          percent={Number(totals.byGroup["Желания"].toFixed(2))}
                          status={error ? "exception" : "normal"}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small" bordered>
                        <Statistic
                          title="Инвестиции (сумма)"
                          value={currencyFormat(
                            dataWithMoney
                              .filter((d) => d.group === "Инвестиции")
                              .reduce((a, b) => a + b.amount, 0),
                            currency
                          )}
                        />
                        <Progress
                          percent={Number(
                            totals.byGroup["Инвестиции"].toFixed(2)
                          )}
                          status={error ? "exception" : "normal"}
                        />
                      </Card>
                    </Col>
                  </Row>
                  <Space>
                    <Text strong>Итого проценты:</Text>
                    <Tag color={error ? "red" : "success"}>
                      {totals.all.toFixed(2)}%
                    </Tag>
                    {error && <Text type="danger">Должно быть 100%</Text>}
                  </Space>
                  <Space>
                    <Text strong>Итого:</Text>
                    <Tag>{currencyFormat(budget, currency)}</Tag>
                    <Button onClick={resetToDefault}>Сбросить к пресету</Button>
                  </Space>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Paragraph>
                  Проценты можно менять. Суммы пересчитываются автоматически из
                  введённого бюджета.
                </Paragraph>
                {error && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Сумма процентов не равна 100%"
                    description="Для корректного распределения скорректируйте значения."
                    style={{ marginBottom: 16 }}
                  />
                )}
                <Table
                  size="middle"
                  rowKey="key"
                  pagination={false}
                  columns={columns}
                  dataSource={dataWithMoney}
                />
              </Card>
            </Col>
          </Row>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Сделано на React + TypeScript + Ant Design
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}
